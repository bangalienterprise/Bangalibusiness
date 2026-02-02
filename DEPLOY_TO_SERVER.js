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

async function uploadFile(sftp, localFile, remoteFile) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) {
        console.error(`Error uploading ${localFile}:`, err);
        // Retry once on failure
        sftp.fastPut(localFile, remoteFile, (retryErr) => {
          if (retryErr) reject(retryErr);
          else {
            console.log(`Uploaded (retry): ${path.basename(localFile)}`);
            resolve();
          }
        });
      } else {
        console.log(`Uploaded: ${path.basename(localFile)}`);
        resolve();
      }
    });
  });
}

async function uploadDirRecursive(sftp, localPath, remotePath) {
  const files = fs.readdirSync(localPath);

  // Ensure remote directory exists
  try {
    await new Promise((resolve, reject) => {
      sftp.mkdir(remotePath, (err) => {
        // Ignore error if directory already exists (code 4)
        if (err && err.code !== 4) reject(err);
        else resolve();
      });
    });
  } catch (e) {
    console.log(`Note: Directory creation for ${remotePath} result: ${e.message}`);
  }

  for (const file of files) {
    const localFile = path.join(localPath, file);
    const remoteFile = remotePath + '/' + file; // Use forward slashes for remote Linux server
    const stats = fs.statSync(localFile);

    if (stats.isDirectory()) {
      await uploadDirRecursive(sftp, localFile, remoteFile);
    } else {
      await uploadFile(sftp, localFile, remoteFile);
    }
  }
}

console.log('Starting Deployment to u562139744@195.35.39.191...');

conn.on('ready', () => {
  console.log('SSH Connection Established.');
  conn.sftp(async (err, sftp) => {
    if (err) {
      console.error("SFTP Error:", err);
      conn.end();
      return;
    }

    console.log('Skipping remote clean (to avoid hang). Starting Upload...');
    try {
      const distPath = path.join(__dirname, 'dist');
      if (!fs.existsSync(distPath)) {
        throw new Error("dist directory not found! Run 'npm run build' first.");
      }
      await uploadDirRecursive(sftp, distPath, 'public_html');
      console.log('==================================================');
      console.log('>>> DEPLOYMENT SUCCESSFUL! <<<');
      console.log('Access your site at: http://195.35.39.191');
      console.log('==================================================');
    } catch (uploadErr) {
      console.error('Upload failed:', uploadErr);
    } finally {
      conn.end();
    }
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
}).connect(config);
