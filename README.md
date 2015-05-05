[![Build Status](https://travis-ci.org/vlkosinov/sitemap2.svg?branch=master)](https://travis-ci.org/vlkosinov/sitemap2)
[![Coverage Status](https://coveralls.io/repos/vlkosinov/sitemap2/badge.svg?branch=master)](https://coveralls.io/r/vlkosinov/sitemap2?branch=master)
[![npm version](https://badge.fury.io/js/sitemap2.svg)](http://badge.fury.io/js/sitemap2)

sitemap2
==========

**sitemap2** is a high-level sitemap-generating framework that makes creating [sitemap XML](http://www.sitemaps.org/) files easy.

## Installation
    $ npm install sitemap2 --save

## Usage


It will produce 3 files: sitemap.xml (index xml file), sitemap-0.xml(movies links) sitemap-1.xml(books links)

```js
var fs = require('fs');
var Sitemap = require('sitemap2');

var host = 'http://vk.com';

var sm = new Sitemap({hostName: host});

var movies = new Sitemap({hostName: host});
movies.addUrl('http://vk.com/movies/video-1');
movies.addUrl('http://vk.com/movies/video-n');

var books = new Sitemap({hostName: host});
books.addUrl('http://vk.com/books/book-1');
books.addUrl('http://vk.com/books/book-n');

sm.addSitemap(movies);
sm.addSitemap(books);

var files = sm.toXML();

files.forEach(function saveFileToDisk(file) {
    fs.writeFileSync(file.fileName, file.xml);
});

```

License
-------
MIT
