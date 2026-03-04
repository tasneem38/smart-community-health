const http = require('http');

const options = {
    hostname: '10.219.162.171',
    port: 3000,
    path: '/ping',
    method: 'GET',
    timeout: 5000
};

console.log('Testing connection to http://10.219.162.171:3000/ping ...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.on('timeout', () => {
    console.error('Request timed out!');
    req.destroy();
});

req.end();
