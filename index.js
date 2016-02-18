module.exports = function() {
    var BOTS = [
        '\\+https:\\/\\/developers.google.com\\/\\+\\/web\\/snippet\\/',
        'googlebot',
        'baiduspider',
        'gurujibot',
        'yandexbot',
        'slurp',
        'msnbot',
        'bingbot',
        'facebookexternalhit',
        'linkedinbot',
        'twitterbot',
        'slackbot',
        'telegrambot',
        'applebot',
        'pingdom',
        'tumblr '
    ];
    var IS_BOT_REGEXP = new RegExp('^.*(' + BOTS.join('|') + ').*$');

    return function*(next) {
        var source = this.request.headers['user-agent'] || '';

        if (typeof source === 'undefined') {
            source = "unknown";
        }

        var isBot = IS_BOT_REGEXP.exec(source.toLowerCase());
        if (isBot) {
            isBot = isBot[1];
        }

        this.state.isBot = isBot;
        yield next;
    }
}
