
import ftp from 'basic-ftp';
import dotenv from 'dotenv';

dotenv.config();

async function debugFtp() {
    const client = new ftp.Client();
    // client.ftp.verbose = true; // Reduced verbosity for clarity

    try {
        console.log("Connecting to FTP...");
        await client.access({
            host: process.env.FTP_HOST || "ftp.bangalienterprise.com",
            user: process.env.FTP_USER || "u562139744.bangalienterprise.com",
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log("Connected.");
        console.log("Current Directory:", await client.pwd());

        console.log("\n--- Listing Root ---");
        const rootList = await client.list();
        rootList.forEach(f => console.log(`[${f.type === 1 ? 'D' : 'F'}] ${f.name} (Size: ${f.size})`));

        // Check if public_html exists
        const publicHtml = rootList.find(f => f.name === 'public_html');
        if (publicHtml) {
            console.log("\n--- Listing public_html ---");
            const phList = await client.list("public_html");
            phList.forEach(f => console.log(`[${f.type === 1 ? 'D' : 'F'}] ${f.name} (Size: ${f.size})`));
            
            // Check for nested public_html
            const nested = phList.find(f => f.name === 'public_html');
            if (nested) {
                 console.log("\n--- Listing public_html/public_html ---");
                 const nestedList = await client.list("public_html/public_html");
                 nestedList.forEach(f => console.log(`[${f.type === 1 ? 'D' : 'F'}] ${f.name} (Size: ${f.size})`));
            }
        }

    } catch (err) {
        console.error("FTP Error:", err);
    } finally {
        client.close();
    }
}

debugFtp();
