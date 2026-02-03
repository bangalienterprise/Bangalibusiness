import { Client } from 'ssh2';

// Load environment variables if needed
if (!process.env.SSH_PASSWORD) {
    try {
        import('dotenv/config');
    } catch (e) {
        // ignore
    }
}

const config = {
    host: process.env.SSH_HOST || '195.35.39.191',
    port: parseInt(process.env.SSH_PORT) || 65002,
    username: process.env.SSH_USER || 'u562139744',
    password: process.env.SSH_PASSWORD, // Must be set in environment
    readyTimeout: 20000,
    keepaliveInterval: 10000
};

if (!config.password) {
    console.warn("Warning: SSH_PASSWORD not set in environment");
}

const conn = new Client();

console.log('Connecting to server to fix permissions...');

conn.on('ready', () => {
    console.log('Connected. Fixing permissions...');
    const cmd = 'chmod 755 public_html && chmod 644 public_html/index.html && chmod 644 public_html/.htaccess && ls -la public_html';
    conn.exec(cmd, (err, stream) => {
        if (err) {
            console.error('Exec error:', err);
            conn.end();
            return;
        }
        stream.on('close', (code, signal) => {
            console.log('Stream close code: ' + code);
            conn.end();
        }).on('data', (data) => {
            console.log('OUTPUT:\n' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).on('error', (err) => {
    console.error('Connection error:', err);
}).connect(config);
