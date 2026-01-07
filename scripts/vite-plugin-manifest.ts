import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite plugin to generate manifest.webmanifest with dynamic start_url
 * For GitHub Pages, sets start_url to "nonamekill.html" (since index.html is occupied)
 * For other deployments, sets start_url to "." (defaults to index.html)
 */
export default function generateManifest(isGithubPages: boolean = false): Plugin {
	return {
		name: "generate-manifest",
		apply: "build",
		generateBundle() {
			// Read the source manifest
			const manifestPath = path.resolve(__dirname, "..", "manifest.webmanifest");
			const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

			// Determine the correct start_url
			// For GitHub Pages: use "nonamekill.html" (because index.html is occupied)
			// For other servers: use "." (which defaults to index.html)
			if (isGithubPages) {
				manifest.start_url = "nonamekill.html";
			} else {
				manifest.start_url = ".";
			}

			// Emit the manifest file
			this.emitFile({
				type: "asset",
				fileName: "manifest.webmanifest",
				source: JSON.stringify(manifest, null, "\t"),
			});
		},
	};
}
