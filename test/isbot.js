var koa = new require('koa');
var request = new require('supertest');

var isBot = new require('../');

exports['koa'] = function(test) {
    var app = koa();

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
