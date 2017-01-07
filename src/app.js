'use strict';
import koa from 'koa';
import json from 'koa-json';
import config  from './config';
import bodyParser from 'koa-bodyparser';

import  router from './routes';
import http from 'http';
const app = new koa();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return /\.json$/i.test(ctx.path);
    },
    extendTypes: {
        json: ['application/x-javascript','application/javascript'] // will parse application/x-javascript type body as a JSON string
    }
}));

app.use(json({pretty:true}));
app
    .use(router.routes())
    .use(router.allowedMethods());
const server = http.createServer(app.callback());
server.listen(config.apiPort);
server.on('listening', () => {
    console.log('Server listening on %s',server.address().port);
});
export default app;

