import http from 'http';
import { buildTestApp } from './app.js';

const app = buildTestApp();

const server = http.createServer(app);
const port = process.env.PORT || 8080;

server.listen(port, () => {
	console.log('listening on', port);
	console.log(`http://localhost:${port}`);
});
