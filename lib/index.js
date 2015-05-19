/**
 * sitemap2 is a high-level sitemap-generating framework that makes creating sitemap XML files easy.
 * https://github.com/vlkosinov/sitemap2
 * @module sitemap2
 * @exports Sitemap
 */

import xmlbuilder from 'xmlbuilder';
import {
    chunkArray,
    validateURL,
    validateChangeFreq,
    validatePriority,
    validateLastMod,
    validateVideo
    } from './utils';

import {NoURLError} from './errors.js';


/**
 * Convert sitemaps tree to list using breadth-first search algorithm
 * !hack: not class member because babel can't perform tail-recursion optimization for class members
 * @memberof Sitemap
 * @private
 * @static
 * @param {Array} result
 * @param {Array} result
 */

function _reduceSitemapsTreeToList(result, sitemaps) {

    let nestedSitemaps = sitemaps.reduce((sum, sm) => {
        return sum.concat(sm.childrens);
    }, []);

    return !nestedSitemaps.length
        ? result
        : _reduceSitemapsTreeToList(result.concat(nestedSitemaps), nestedSitemaps);
}

export default class Sitemap {


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
     * @param {String} [conf.urls[].priority=0.5] - The priority of this URL relative to other URLs on your site. Valid values range from 0.0 to 1.0
     *
     *
     * var files = new Sitemap({fileName: 'my-pretty-sitemap.xml'})
     *  .addUrl('http://vk.com/books/book-1')
     *  .toXML() //--> [{ fileName: 'my-pretty-sitemap.xml', 'xml': '<?xml ... [bla-bla] ... >}]
     *
     */

    constructor(conf) {
        conf = conf || {};

        // This limit is defined by Google. See: http://sitemaps.org/protocol.php#index
        this.limit = conf.limit || 50000;
        this.hostName = conf.hostName || '';
        this.fileName = conf.fileName || '';
        this.urls = conf.urls || [];
        this.childrens = conf.childrens || [];
    }

    addUrl(urlData) {
        if (!urlData) {
            throw new NoURLError();
        }
        if (Array.isArray(urlData)) {
            urlData.forEach(url => this.addUrl(url));
            return this;
        }
        if (typeof urlData === 'string') {
            urlData = {url: urlData};
        }

        let data = {
            url: validateURL(urlData.url),
            changefreq: urlData.changefreq ? validateChangeFreq(urlData.changefreq) : 'weekly',
            priority: urlData.priority ? validatePriority(urlData.priority) : 0.5
        };

        if (urlData.lastmod || urlData.lastmodISO) {
            data.lastmod = validateLastMod(urlData.lastmod, urlData.lastmodISO);
        }
        if (urlData.video) {
            data.video = validateVideo(urlData.video);
        }

        this.urls.push(data);
        return this;
    }

    addSitemap(sitemap) {
        this.childrens.push(sitemap);
        return this;
    }

    toXML() {
        let sitemapsList = _reduceSitemapsTreeToList([this].concat(this.childrens), this.childrens)
            .filter(sm => sm.urls.length || !sm.childrens.length)
            .map(Sitemap._setFileNameIfNotExist)
            .reduce(Sitemap._normalizeSize, []);

        let siteMapsWithUrls = sitemapsList.filter(sm => sm.urls.length).map(Sitemap._toXMLWithUrls);

        if (sitemapsList.length > 1) {
            let sitemapIndexXML = xmlbuilder.create('sitemapindex');
            sitemapIndexXML.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
            Sitemap._fillSitemapElement(sitemapIndexXML, sitemapsList);
            siteMapsWithUrls.unshift({
                fileName: 'sitemap.xml',
                xml: sitemapIndexXML.end({pretty: true})
            });
        }

        return siteMapsWithUrls;
    }

    static _normalizeSize(result, sitemap) {
        const shouldBeChunked = sitemap.urls.length >= sitemap.limit;
        if (!shouldBeChunked) {
            result.push(sitemap);
            return result;
        }

        const chunkedUrls = chunkArray(sitemap.urls, sitemap.limit);
        let chunkedSitemaps = chunkedUrls.map((urls, i) => {
            let surrogate = new Sitemap(sitemap);
            surrogate.urls = urls;
            surrogate.fileName = surrogate.fileName.replace(/(\.xml$|$)/, `-${i}$1`);
            surrogate.childrens = [];
            return surrogate;
        });

        //we should save nested sitemaps only for one of chunked sitemaps
        chunkedSitemaps[0].childrens = sitemap.childrens;
        chunkedSitemaps.forEach(sm => result.push(sm));
        return result;
    }


    static _setFileNameIfNotExist(sitemap, index) {
        if (!sitemap.fileName) {
            sitemap.fileName = `sitemap-${index}.xml`;
        }
        return sitemap;
    }

    static _toXMLWithUrls(sitemap) {
        let urls = sitemap.urls;
        let urlset = xmlbuilder.create('urlset');
        urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

        urls.forEach(url => {
            let urlEl = urlset.ele('url');
            urlEl.ele('loc', {}, url.url);
            urlEl.ele('changefreq', {}, url.changefreq);
            urlEl.ele('priority', {}, url.priority);
            if (url.lastmod) {
                urlEl.ele('lastmod', {}, url.lastmod);
            }
            if (url.video) {
                urlset.att('xmlns:video', 'http://www.google.com/schemas/sitemap-video/1.1');
                let video = urlEl.ele('video:video');
                Object.keys(url.video).forEach(key => {
                    video.ele(`video:${key}`, {}, url.video[key]);
                });
            }
        });

        return {
            fileName: sitemap.fileName,
            xml: urlset.end({pretty: true})
        };
    }

    static _fillSitemapElement(sitemapIndexXML, sitemapsList) {
        sitemapsList.forEach(sm => {
            let fileName = sm.fileName;
            let hostName = sm.hostName;
            sitemapIndexXML
                .ele('sitemap')
                .ele('loc', {}, `${hostName}/${fileName}`);
        });
    }

}
