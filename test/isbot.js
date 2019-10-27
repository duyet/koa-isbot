var koa = require('koa');
var request = require('supertest');

var isBot = require('../');

exports['koa'] = function(test) {
    var app = new koa();

    app.use(isBot());

    app.use(function*(next) {
    	test.equal(this.state.isBot, null, 'null if not is bot');
    	
        yield next;
    });

    request(app.listen()).get('/').end(function() {
        test.done();

        setTimeout(function() {
            process.exit();
        });
    });
};
