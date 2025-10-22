import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import crypto from 'node:crypto';
import { configureNunjucksTestEnv } from './nunjucks.js';

/**
 * Create an Express app configured for testing with Nunjucks and session support.
 * @returns {import('express').Express}
 */
export function createApp() {
	const app = express();

	// configure body-parser, to populate req.body
	// see https://expressjs.com/en/resources/middleware/body-parser.html
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.use(
		session({
			secret: crypto.randomUUID(),
			resave: false,
			saveUninitialized: false,
			store: new session.MemoryStore(),
			unset: 'destroy',
			cookie: {
				secure: false,
				maxAge: 86_400_000 // 1 day in milliseconds
			}
		})
	);

	const nunjucksEnvironment = configureNunjucksTestEnv();
	// Set the express view engine to nunjucks
	// calls to res.render will use nunjucks
	nunjucksEnvironment.addGlobal('govukRebrand', true);
	nunjucksEnvironment.express(app);
	app.set('view engine', 'njk');

	return app;
}
