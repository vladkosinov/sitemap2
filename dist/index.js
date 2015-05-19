'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * sitemap2 is a high-level sitemap-generating framework that makes creating sitemap XML files easy.
 * https://github.com/vlkosinov/sitemap2
 * @module sitemap2
 * @exports Sitemap
 */

var _xmlbuilder = require('xmlbuilder');

var _xmlbuilder2 = _interopRequireDefault(_xmlbuilder);

var _utils = require('./utils');

var _errorsJs = require('./errors.js');

function _reduceSitemapsTreeToList(_x, _x2) {
    var _again = true;

    _function: while (_again) {
        nestedSitemaps = undefined;
        _again = false;
        var result = _x,
            sitemaps = _x2;

        var nestedSitemaps = sitemaps.reduce(function (sum, sm) {
            return sum.concat(sm.childrens);
        }, []);

        if (!nestedSitemaps.length) {
            return result;
        } else {
            _x = result.concat(nestedSitemaps);
            _x2 = nestedSitemaps;
            _again = true;
            continue _function;
        }
    }
}

var Sitemap = (function () {

    /**
     * Creates a new `Sitemap` instance
     * @constructs Sitemap
     * @param {Object} conf
     *
     * @param {String} conf.hostName
     * Host name where this site sitemap will be placed.
     * It will be used in `index sitemap` (link will be created by pattern: `${hostName}/${fileName}`).
     * Required when using nested sitemaps or splitting by limit.
     *
     * @param {String} [conf.fileName=sitemap.xml]
     * Used for generating `fileName` in result of `.toXML()`, for creating link to this sitemap for *index sitemap* .
     *
     * @param {Url[]} [conf.urls] - Array of url objects
     * @param {String} conf.urls[].url - URL of the page
     * @param {String} [conf.urls[].changefreq] - How frequently the page is likely to change: 'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'
     * @param {String} [conf.urls[]. priority=0.5] - The priority of this URL relative to other URLs on your site. Valid values range from 0.0 to 1.0
     *
     *
     * var files = new Sitemap({fileName: 'my-pretty-sitemap.xml'})
     *  .addUrl('http://vk.com/books/book-1')
     *  .toXML() //--> [{ fileName: 'my-pretty-sitemap.xml', 'xml': '<?xml ... [bla-bla] ... >}]
     *
     */

    function Sitemap(conf) {
        _classCallCheck(this, Sitemap);

        conf = conf || {};

        // This limit is defined by Google. See: http://sitemaps.org/protocol.php#index
        this.limit = conf.limit || 50000;
        this.hostName = conf.hostName || '';
        this.fileName = conf.fileName || '';
        this.urls = conf.urls || [];
        this.childrens = conf.childrens || [];
    }

    _createClass(Sitemap, [{
        key: 'addUrl',
        value: function addUrl(urlData) {
            var _this2 = this;

            if (!urlData) {
                throw new _errorsJs.NoURLError();
            }
            if (Array.isArray(urlData)) {
                urlData.forEach(function (url) {
                    return _this2.addUrl(url);
                });
                return this;
            }
            if (typeof urlData === 'string') {
                urlData = { url: urlData };
            }

            var data = {
                url: _utils.validateURL(urlData.url),
                changefreq: urlData.changefreq ? _utils.validateChangeFreq(urlData.changefreq) : 'weekly',
                priority: urlData.priority ? _utils.validatePriority(urlData.priority) : 0.5
            };

            if (urlData.lastmod || urlData.lastmodISO) {
                data.lastmod = _utils.validateLastMod(urlData.lastmod, urlData.lastmodISO);
            }
            if (urlData.video) {
                data.video = _utils.validateVideo(urlData.video);
            }

            this.urls.push(data);
            return this;
        }
    }, {
        key: 'addSitemap',
        value: function addSitemap(sitemap) {
            this.childrens.push(sitemap);
            return this;
        }
    }, {
        key: 'toXML',
        value: function toXML() {
            var sitemapsList = _reduceSitemapsTreeToList([this].concat(this.childrens), this.childrens).filter(function (sm) {
                return sm.urls.length || !sm.childrens.length;
            }).map(Sitemap._setFileNameIfNotExist).reduce(Sitemap._normalizeSize, []);

            var siteMapsWithUrls = sitemapsList.filter(function (sm) {
                return sm.urls.length;
            }).map(Sitemap._toXMLWithUrls);

            if (sitemapsList.length > 1) {
                var sitemapIndexXML = _xmlbuilder2['default'].create('sitemapindex');
                sitemapIndexXML.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
                Sitemap._fillSitemapElement(sitemapIndexXML, sitemapsList);
                siteMapsWithUrls.unshift({
                    fileName: 'sitemap.xml',
                    xml: sitemapIndexXML.end({ pretty: true })
                });
            }

            return siteMapsWithUrls;
        }
    }], [{
        key: '_normalizeSize',
        value: function _normalizeSize(result, sitemap) {
            var shouldBeChunked = sitemap.urls.length >= sitemap.limit;
            if (!shouldBeChunked) {
                result.push(sitemap);
                return result;
            }

            var chunkedUrls = _utils.chunkArray(sitemap.urls, sitemap.limit);
            var chunkedSitemaps = chunkedUrls.map(function (urls, i) {
                var surrogate = new Sitemap(sitemap);
                surrogate.urls = urls;
                surrogate.fileName = surrogate.fileName.replace(/(\.xml$|$)/, '-' + i + '$1');
                surrogate.childrens = [];
                return surrogate;
            });

            //we should save nested sitemaps only for one of chunked sitemaps
            chunkedSitemaps[0].childrens = sitemap.childrens;
            chunkedSitemaps.forEach(function (sm) {
                return result.push(sm);
            });
            return result;
        }
    }, {
        key: '_setFileNameIfNotExist',
        value: function _setFileNameIfNotExist(sitemap, index) {
            if (!sitemap.fileName) {
                sitemap.fileName = 'sitemap-' + index + '.xml';
            }
            return sitemap;
        }
    }, {
        key: '_toXMLWithUrls',
        value: function _toXMLWithUrls(sitemap) {
            var urls = sitemap.urls;
            var urlset = _xmlbuilder2['default'].create('urlset');
            urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

            urls.forEach(function (url) {
                var urlEl = urlset.ele('url');
                urlEl.ele('loc', {}, url.url);
                urlEl.ele('changefreq', {}, url.changefreq);
                urlEl.ele('priority', {}, url.priority);
                if (url.lastmod) {
                    urlEl.ele('lastmod', {}, url.lastmod);
                }
                if (url.video) {
                    (function () {
                        urlset.att('xmlns:video', 'http://www.google.com/schemas/sitemap-video/1.1');
                        var video = urlEl.ele('video:video');
                        Object.keys(url.video).forEach(function (key) {
                            video.ele('video:' + key, {}, url.video[key]);
                        });
                    })();
                }
            });

            return {
                fileName: sitemap.fileName,
                xml: urlset.end({ pretty: true })
            };
        }
    }, {
        key: '_fillSitemapElement',
        value: function _fillSitemapElement(sitemapIndexXML, sitemapsList) {
            sitemapsList.forEach(function (sm) {
                var fileName = sm.fileName;
                var hostName = sm.hostName;
                sitemapIndexXML.ele('sitemap').ele('loc', {}, '' + hostName + '/' + fileName);
            });
        }
    }]);

    return Sitemap;
})();

exports['default'] = Sitemap;
module.exports = exports['default'];