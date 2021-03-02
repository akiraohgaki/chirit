import {SimpleDevServer} from 'simple-dev-server';

const server = new SimpleDevServer({
    rewriteRules: [
        ['^/demo/', '/src/demo/index.html'],
        ['^/test/', '/src/test/index.html']
    ]
});
server.start();
