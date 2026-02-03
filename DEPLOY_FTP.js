
import ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    // Load environment variables if not already loaded (for standalone script usage)
    if (!process.env.FTP_HOST) {
        try {
            await import('dotenv/config');
        } catch (e) {
            console.warn("dotenv not found, ensure variables are set in environment");
        }
    }

    try {
        const ftpHost = process.env.FTP_HOST || "ftp.bangalienterprise.com";
        const ftpUser = process.env.FTP_USER || "u562139744.bangalienterprise.com";

        if (!process.env.FTP_PASSWORD) {
            throw new Error("FTP_PASSWORD environment variable is required");
        }

        console.log(`Connecting to FTP as ${ftpUser}@${ftpHost}...`);
        await client.access({
            host: ftpHost,
            user: ftpUser,
            password: process.env.FTP_PASSWORD,
            secure: false // Try insecure first if explicit FTPS fails or use "test" to auto-upgrade
        });

        console.log("Connected!");
        console.log("Current Remote Directory:", await client.pwd());

        const distPath = path.join(__dirname, 'dist');
        if (!fs.existsSync(distPath)) {
            throw new Error("dist directory not found! Ensure 'npm run build' has run.");
        }

        // Upload everything from dist to current directory (.)
        // We assume the FTP user is already grounded in public_html based on debug logs.
        console.log("Uploading files to root directory...");
        await client.uploadFromDir(distPath, ".");

        console.log("Deployment Complete!");
    } catch (err) {
        console.error("Deployment Failed:", err);
    } finally {
        client.close();
    }
}

deploy();
