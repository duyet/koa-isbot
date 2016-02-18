# koa-isbot [![Build Status](https://travis-ci.org/duyetdev/koa-isbot.svg?branch=master)](https://travis-ci.org/duyetdev/koa-isbot)

Koa detect robots. Fast Middleware detect bot crawler for Koa.

[![NPM](https://nodei.co/npm/koa-isbot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/koa-isbot/)

# Installation

```sh
npm install koa-isbot --save 
```

# Usage

```js
var koa = require('koa')
  , app = koa.app()
  , isBot = require('koa-isbot');

app.use(isBot());

app.use(function *(next) {
    console.log('isBot? ', this.state.isBot); 
    // null or 'googlebot', 'bingbot', ...
});

app.listen(3000);
```

# Support list 

* Google bot - `googlebot`
* Baidu - `baiduspider`
* Guruji - `gurujibot`
* Yandex - `yandexbot`
* Slurp- `slurp`
* MSN - `msnbot`
* Bing - `bingbot`
* Facebook - `facebookexternalhit`
* Linkedin - `linkedinbot`
* Twitter - `twitterbot`
* Slack - `slackbot`
* Telegram - `telegrambot`
* Apple - `applebot`
* Pingdom - `pingdom`
* tumblr - `tumblr `

# How to contribute

1. Fork the project on Github
2. Create a topic branch for your changes
3. Ensure that you provide documentation and test coverage for your changes (patches won’t be accepted without)
4. Create a pull request on Github (these are also a great place to start a conversation around a patch as early as possible)

# License

MIT License

Copyright (c) 2016 Van-Duyet Le

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.