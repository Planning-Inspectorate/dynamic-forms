import http from 'http';
import type { TestContext } from 'node:test';

const DEFAULT_OPTIONS: RequestInit = {
	credentials: 'include'
};

export class TestServer {
	// Private cookie jar for storing cookies between requests
	readonly #cookieJar: Record<string, string> = {};
	readonly requestListener: http.RequestListener;
	readonly #timeoutMs: number;
	rememberCookies: boolean;
	server: http.Server | null;
	port: number | null;

	static async withContext(ctx: TestContext, requestListener: http.RequestListener): Promise<TestServer> {
		const server = new TestServer(requestListener);
		await server.start();
		ctx.after(async () => await server.stop());
		return server;
	}

	/**
	 * @param requestListener
	 * @param [options]
	 * @param [options.rememberCookies] - If true, cookies are stored and sent with each request
	 * @param [options.timeoutMs] - timeout to use for fetch requests
	 */
	constructor(requestListener: http.RequestListener, options: { rememberCookies?: boolean; timeoutMs?: number } = {}) {
		this.requestListener = requestListener;
		this.server = null;
		this.port = null;
		this.rememberCookies = Boolean(options.rememberCookies);
		this.#timeoutMs = options.timeoutMs || 5000;
	}

	/**
	 * Starts the server on a random port.
	 */
	async start(): Promise<void> {
		if (this.server) return;
		const server = http.createServer(this.requestListener);
		await new Promise<void>((resolve, reject) => {
			server.listen(0, '127.0.0.1');
			server.on('listening', () => {
				const address = server.address();
				if (address !== null && typeof address === 'object' && 'port' in address) {
					this.port = address.port;
					resolve();
				} else {
					reject('unable to get server port');
				}
			});
			server.on('error', reject);
		});
		this.server = server;
	}

	/**
	 * Stops the server.
	 */
	async stop(): Promise<void> {
		const server = this.server;
		if (!server) return;
		await new Promise<void>((resolve, reject) => {
			server.close((err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		this.server = null;
		this.port = null;
	}

	/**
	 * Performs a GET request to the server.
	 */
	async get(path: string, options: RequestInit = {}): Promise<Response> {
		if (!this.server || !this.port) {
			throw new Error('Server is not started');
		}
		const fetchOptions: RequestInit = { headers: {}, ...DEFAULT_OPTIONS, ...options, method: 'GET' };
		this.#addCookies(fetchOptions.headers);
		return this.#fetch(path, fetchOptions);
	}

	/**
	 * Performs a GET request to the server, following a maximum number of redirects.
	 */
	async getWithRedirects(path: string, maxRedirects: number, options: RequestInit = {}): Promise<Response> {
		if (!this.server || !this.port) {
			throw new Error('Server is not started');
		}
		if (maxRedirects === 0) {
			// can just use get() directly otherwise
			throw new Error('maxRedirects must be greater than 0');
		}
		let response: Response | undefined;
		let currentPath = path;
		let numRedirects = 0;
		while (true) {
			response = await this.get(currentPath, { ...options, redirect: 'manual' });
			if (
				response.status >= 300 &&
				response.status < 400 &&
				response.headers.has('location') &&
				numRedirects < maxRedirects
			) {
				const location = response.headers.get('location');
				if (location === null) {
					break;
				}
				currentPath = location;
				numRedirects++;
				continue;
			}
			break;
		}
		if (this.rememberCookies) {
			this.#updateCookies(response);
		}
		return response;
	}

	/**
	 * Performs a POST request to the server.
	 */
	async post(path: string, body: unknown = {}, options: RequestInit = {}): Promise<Response> {
		if (!this.server || !this.port) {
			throw new Error('Server is not started');
		}
		const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
		const fetchOptions = {
			...DEFAULT_OPTIONS,
			...options,
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		};
		this.#addCookies(fetchOptions.headers);
		return this.#fetch(path, fetchOptions);
	}

	/**
	 * Perform a fetch request with a timeout
	 */
	async #fetch(path: string, options: RequestInit) {
		// set up an abort controller to cancel requests after timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.#timeoutMs);
		options.signal = controller.signal;
		try {
			const response = await fetch(`http://localhost:${this.port}${path}`, options);
			if (this.rememberCookies) {
				this.#updateCookies(response);
			}
			return response;
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				// eslint-disable-next-line preserve-caught-error
				throw new Error(`Request to ${path} timed out after ${this.#timeoutMs}ms`);
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	#addCookies(headers: HeadersInit | undefined) {
		if (!this.rememberCookies) return;
		if (!headers) return;
		if (this.#cookies) {
			// @ts-expect-error this is OK, we only use the header set
			headers.Cookie = this.#cookies;
		}
	}

	get #cookies() {
		return Object.entries(this.#cookieJar)
			.map(([k, v]) => `${k}=${v}`)
			.join('; ');
	}

	/**
	 * Update the internal cookie jar from a fetch Response
	 */
	#updateCookies(response: Response) {
		const cookies = response.headers.getSetCookie();
		if (!cookies) return;
		const cookieKv = cookies.map((c) => c.split(';')[0]);
		for (const c of cookieKv) {
			const [k, v] = c.split('=');
			this.#cookieJar[k] = v;
		}
	}
}
