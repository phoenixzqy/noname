/**
 * Post-build script to update manifest.webmanifest start_url
 * Usage: tsx scripts/set-manifest-start-url.ts <start_url>
 * Example: tsx scripts/set-manifest-start-url.ts nonamekill.html
 */
import fs from "fs";
import path from "path";

const startUrl = process.argv[2];

if (!startUrl) {
	console.error("Usage: tsx scripts/set-manifest-start-url.ts <start_url>");
	console.error("Example: tsx scripts/set-manifest-start-url.ts nonamekill.html");
	process.exit(1);
}

const manifestPath = path.resolve("dist", "manifest.webmanifest");

if (!fs.existsSync(manifestPath)) {
	console.error(`Error: ${manifestPath} not found. Run build first.`);
	process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.start_url = startUrl;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));

console.log(`✓ Updated manifest.webmanifest start_url to "${startUrl}"`);
