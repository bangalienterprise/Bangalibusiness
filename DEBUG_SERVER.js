import { Client } from 'ssh2';

const config = {
    host: '195.35.39.191',
    port: 65002,
    username: 'u562139744',
    password: 'Bangaliadmin@2025.!?',
    readyTimeout: 20000,
    keepaliveInterval: 10000
};

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
