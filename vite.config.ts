import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

const port = {
	// Vite dev server port for static files
	client: 8089,
	// noname-server port for REST APIs and WebSocket in dev mode
	server: 8088,
};

// Check if SSL certificates exist for HTTPS mode
const sslCertPath = path.resolve(__dirname, "ssl/cert.pem");
const sslKeyPath = path.resolve(__dirname, "ssl/key.pem");
const hasSSL = fs.existsSync(sslCertPath) && fs.existsSync(sslKeyPath);
const useSSL = process.env.USE_SSL === "true";

export default defineConfig({
	root: ".",
	base: "./",
	resolve: {
		alias: {
			"@": "/noname",
			noname: "/noname.js",
		},
		extensions: [".tsx", ".ts", ".js", ".vue"],
	},
	plugins: [vue()],
	server: {
		host: "127.0.0.1",
		port: port.client,
		// Enable HTTPS if USE_SSL env is set and certificates exist
		https: useSSL && hasSSL ? {
			cert: fs.readFileSync(sslCertPath),
			key: fs.readFileSync(sslKeyPath),
		} : undefined,
		fs: {
			allow: ["../.."],
		},
		proxy: {
			"/checkFile": "http://127.0.0.1:" + port.server,
			"/checkDir": "http://127.0.0.1:" + port.server,
			"/readFile": "http://127.0.0.1:" + port.server,
			"/readFileAsText": "http://127.0.0.1:" + port.server,
			"/writeFile": "http://127.0.0.1:" + port.server,
			"/removeFile": "http://127.0.0.1:" + port.server,
			"/getFileList": "http://127.0.0.1:" + port.server,
			"/createDir": "http://127.0.0.1:" + port.server,
			"/removeDir": "http://127.0.0.1:" + port.server,
		},
	},
});
