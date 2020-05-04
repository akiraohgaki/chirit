const http = require('http');
const fs = require('fs');

const mimeTypes = {
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
    'svg': 'image/svg+xml',
    'json': 'application/json'
};

const httpHeaders = {
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
};

http.createServer((req, res) => {
    const sendErrorMessage = (statusCode, message) => {
        res.writeHead(statusCode, {
            ...httpHeaders,
            'Content-Type': 'text/plain'
        });
        res.write(message);
        res.end();
    };

    const sendFile = (path) => {
        fs.readFile(path, (err, data) => {
            if (!err) {
                res.writeHead(200, {
                    ...httpHeaders,
                    'Content-Type': mimeTypes[path.split('.').pop()] || 'application/octet-stream'
                });
                res.write(data);
                res.end();
            }
            else {
                sendErrorMessage(404, 'Not Found');
            }
        });
    };

    console.log(req.url);

    if (req.url.startsWith('/demo/')) {
        sendFile(`${__dirname}/src/demo/index.html`);
    }
    else if (req.url.startsWith('/test/')) {
        sendFile(`${__dirname}/src/test/index.html`);
    }
    else {
        sendFile(`${__dirname}/${req.url}`);
    }
})
.listen(8080);
