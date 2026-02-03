import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conn = new Client();

const config = {
  host: '195.35.39.191',
  port: 65002,
  username: 'u562139744',
  password: 'Bangaliadmin@2025.!?',
  readyTimeout: 20000,
  keepaliveInterval: 10000
};

// Recursive delete function for SFTP
async function rmdirRecursive(sftp, remotePath) {
    try {
        const list = await new Promise((resolve, reject) => {
            sftp.readdir(remotePath, (err, list) => {
                if (err) reject(err);
                else resolve(list);
            });
        });

        for (const item of list) {
            const currentPath = `${remotePath}/${item.filename}`;
            if (item.longname.startsWith('d')) { // Directory
                if (item.filename !== '.' && item.filename !== '..') {
                    await rmdirRecursive(sftp, currentPath);
                    await new Promise((resolve, reject) => {
                        sftp.rmdir(currentPath, (err) => err ? reject(err) : resolve());
                    });
                }
            } else { // File
                await new Promise((resolve, reject) => {
                    sftp.unlink(currentPath, (err) => err ? reject(err) : resolve());
                });
            }
        }
    } catch (e) {
        console.log(`Cleanup note for ${remotePath}: ${e.message} (Is it empty?)`);
    }
}

async function uploadFile(sftp, localFile, remoteFile) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) {
        console.error(`Error uploading ${localFile}:`, err);
        reject(err);
      } else {
        console.log(`Uploaded: ${path.basename(localFile)}`);
        resolve();
      }
    });
  });
}

async function uploadDirRecursive(sftp, localPath, remotePath) {
  const files = fs.readdirSync(localPath);

  try {
    await new Promise((resolve, reject) => {
      sftp.mkdir(remotePath, (err) => {
        if (err && err.code !== 4) reject(err);
        else resolve();
      });
    });
  } catch (e) {
    // Ignore dir exists
  }

  for (const file of files) {
    const localFile = path.join(localPath, file);
    const remoteFile = remotePath + '/' + file;
    const stats = fs.statSync(localFile);

    if (stats.isDirectory()) {
      await uploadDirRecursive(sftp, localFile, remoteFile);
    } else {
      await uploadFile(sftp, localFile, remoteFile);
    }
  }
}

console.log('Starting Deployment (SSH)...');

conn.on('ready', () => {
  console.log('SSH Connection Established.');
  conn.sftp(async (err, sftp) => {
    if (err) {
      console.error("SFTP Error:", err);
      conn.end();
      return;
    }

    // Try to list the root to see where we are
    sftp.readdir('.', (err, list) => {
        console.log('Remote Root Listing:', list ? list.map(i => i.filename).join(', ') : err.message);
        
        // Define target based on listing
        const targetDir = 'public_html'; 
        
        // Use an async wrapper for the main logic
        (async () => {
            try {
                const distPath = path.join(__dirname, 'dist');
                if (!fs.existsSync(distPath)) throw new Error("dist directory missing!");

                console.log(`Cleaning remote directory: ${targetDir}...`);
                // Note: Clearing public_html might be risky if it contains other stuff, 
                // but necessary to remove old 'Uu.js' artifacts.
                // We will skip full recursive delete of public_html root to avoid deleting .well-known etc.
                // Instead, we just overwrite. 
                // A better approach: Delete specific known bad files if they exist?
                // Or just trust the overwrite.
                
                // Let's try overwrite first. Use uploaded list to check.
                
                console.log('Uploading new build...');
                await uploadDirRecursive(sftp, distPath, targetDir);
                
                console.log('==================================================');
                console.log('>>> DEPLOYMENT SUCCESSFUL! <<<');
                console.log('==================================================');
            } catch (e) {
                console.error('Deployment Failed:', e);
            } finally {
                conn.end();
            }
        })();
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
}).connect(config);