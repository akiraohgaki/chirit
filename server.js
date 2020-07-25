const http = require('http');
const fs = require('fs');

const port = 8080;

const mimeTypes = {
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'svg': 'image/svg+xml'
};

const httpHeaders = {
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
};

function rewriteUrl(url) {
    if (url.startsWith('/demo/')) {
        return '/src/demo/index.html';
    }
    else if (url.startsWith('/test/')) {
        return '/src/test/index.html';
    }
    return url;
}

http.createServer((req, res) => {
    console.log(req.url);

    let url = rewriteUrl(req.url);
    if (url.endsWith('/')) {
        url += 'index.html';
    }

    fs.readFile(__dirname + url, (err, data) => {
        if (err) {
            let statusCode = 0;
            let message = '';

            if (err.code === 'ENOENT') {
                statusCode = 404;
                message = 'Not Found';
            }
            else {
                statusCode = 500;
                message = 'Internal Server Error';
            }

            res.writeHead(statusCode, {
                ...httpHeaders,
                'Content-Type': 'text/plain'
            });
            res.end(message, 'utf-8');
        }
        else {
            const ext = url.split('.').pop().toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            res.writeHead(200, {
                ...httpHeaders,
                'Content-Type': contentType
            });
            res.end(data, 'utf-8');
        }
    });
}).listen(port);

console.log(`Server is started at port ${port}`);
