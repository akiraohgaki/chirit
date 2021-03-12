import {SimpleDevServer} from 'simple-dev-server';

const server = new SimpleDevServer({
    documentRoot: process.cwd() + '/dist',
    rewriteRules: [
        ['(.+\\.\\w+)$', '$1'],
        ['^/(demo|test)/.*', '/../src/$1/index.html']
    ]
});
server.start();
