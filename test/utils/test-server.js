import http from 'http';

const DEFAULT_OPTIONS = {
	credentials: 'include'
};

export class TestServer {
	// Private cookie jar for storing cookies between requests
	/** @type {Object<string, string>} */
	#cookieJar = {};

	/**
	 * @param {import('http').RequestListener} requestListener
	 * @param {object} [options]
	 * @param {boolean} [options.rememberCookies] - If true, cookies are stored and sent with each request
	 */
	constructor(requestListener, options = {}) {
		this.requestListener = requestListener;
		this.server = null;
		this.port = null;
		this.rememberCookies = Boolean(options.rememberCookies);
	}

	/**
	 * Starts the server on a random port.
	 * @returns {Promise<void>}
	 */
	async start() {
		if (this.server) return;
		this.server = http.createServer(this.requestListener);
		await new Promise((resolve, reject) => {
			this.server.listen(0, '127.0.0.1');
			this.server.on('listening', () => {
				this.port = this.server.address().port;
				resolve();
			});
			this.server.on('error', reject);
		});
	}

	/**
	 * Stops the server.
	 * @returns {Promise<void>}
	 */
	async stop() {
		if (!this.server) return;
		await new Promise((resolve, reject) => {
			this.server.close((err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		this.server = null;
		this.port = null;
	}

	/**
	 * Performs a GET request to the server.
	 * @param {string} path
	 * @param {RequestInit} [options]
	 * @returns {Promise<Response>}
	 */
	async get(path, options = {}) {
		if (!this.server || !this.port) {
			throw new Error('Server is not started');
		}
		const fetchOptions = { headers: {}, ...DEFAULT_OPTIONS, ...options, method: 'GET' };
		this.#addCookies(fetchOptions.headers);
		const response = await fetch(`http://localhost:${this.port}${path}`, fetchOptions);
		if (this.rememberCookies) {
			this.#updateCookies(response);
		}
		return response;
	}

	/**
	 * Performs a GET request to the server, following a maximum number of redirects.
	 * @param {string} path
	 * @param {number} maxRedirects
	 * @param {RequestInit} [options]
	 * @returns {Promise<Response>}
	 */
	async getWithRedirects(path, maxRedirects, options = {}) {
		if (!this.server || !this.port) {
			throw new Error('Server is not started');
		}
		if (maxRedirects === 0) {
			// can just use get() directly otherwise
			throw new Error('maxRedirects must be greater than 0');
		}
		let response;
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
				currentPath = response.headers.get('location');
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
	 * @param {string} path
	 * @param {object} [body]
	 * @param {RequestInit} [options]
	 * @returns {Promise<Response>}
	 */
	async post(path, body = {}, options = {}) {
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
		const response = await fetch(`http://localhost:${this.port}${path}`, fetchOptions);
		if (this.rememberCookies) {
			this.#updateCookies(response);
		}
		return response;
	}

	#addCookies(headers) {
		if (!this.rememberCookies) return;
		if (this.#cookies) {
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
	 * @param {Response} response
	 */
	#updateCookies(response) {
		const cookies = response.headers.getSetCookie();
		if (!cookies) return;
		const cookieKv = cookies.map((c) => c.split(';')[0]);
		for (const c of cookieKv) {
			const [k, v] = c.split('=');
			this.#cookieJar[k] = v;
		}
	}
}
