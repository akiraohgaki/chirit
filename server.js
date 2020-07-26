const http = require('http');
const fs = require('fs');

const additionalConfig = {
    rewriteRules: [
        ['^/demo/', '/src/demo/index.html'],
        ['^/test/', '/src/test/index.html']
    ]
};

const config = {
    port: 8080,
    documentRoot: __dirname,
    directoryIndex: 'index.html',
    headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    },
    mimeTypes: {
        'html': 'text/html',
        'js': 'text/javascript',
        'css': 'text/css',
        'json': 'application/json',
        'svg': 'image/svg+xml'
    },
    rewriteRules: [],
    ...additionalConfig
};

http.createServer((req, res) => {
    console.log(req.url);

    let url = req.url;

    if (config.rewriteRules.length) {
        for (const [pattern, path] of config.rewriteRules) {
            if (url.search(new RegExp(pattern)) !== -1) {
                url = path;
                break;
            }
        }
    }

    if (url.endsWith('/')) {
        url += config.directoryIndex;
    }

    fs.readFile(config.documentRoot + url, (err, data) => {
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
                ...config.headers,
                'Content-Type': 'text/plain'
            });
            res.end(message, 'utf-8');
        }
        else {
            const ext = url.split('.').pop().toLowerCase();
            const contentType = config.mimeTypes[ext] || 'application/octet-stream';

            res.writeHead(200, {
                ...config.headers,
                'Content-Type': contentType
            });
            res.end(data, 'utf-8');
        }
    });
}).listen(config.port);

console.log(`Server is started at port ${config.port}`);
