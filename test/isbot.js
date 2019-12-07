var koa = require('koa');
var request = require('supertest');

var isBot = require('../');

exports['koa'] = function(test) {
    const app1 = new koa();
    const app2 = new koa();

    app1.use(isBot());
    app2.use(isBot());

    app1.use(async (ctx, next) => {
    	test.equal(ctx.isBot, null, 'null if not is bot');
        await next();
    });

    request(app1.listen()).get('/').end(function() {
        test.done();

        setTimeout(function() {
            process.exit();
        });
    });


    app2.use(async (ctx, next) => {
        console.log(ctx.isBot)
    	test.equal(ctx.isBot, 'googlebot', 'is googlebot');
        await next();
    });
    request(app2.listen()).get('/').set('User-Agent', 'googlebot').end(function() {
        test.done();

        setTimeout(function() {
            process.exit();
        });
    });
};
