var readDir = require('fs-readdir-recursive'),
    path = require('path'),
    fs = require('fs');

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var TEST_TARGET = process.env['TEST_TARGET'];

var Sitemap = require(path.resolve(TEST_TARGET));
var errors = require(path.resolve(TEST_TARGET), '/errors');

function setValueByPathInObject(value, path, obj) {
    if (path.length === 1) {
        obj[path.pop()] = value;
        return;
    }
    var currentPathPart = path.shift();
    if (typeof obj[currentPathPart] === 'undefined') {
        obj[currentPathPart] = {};
    }

    setValueByPathInObject(value, path, obj[currentPathPart]);
}

var dataDir = path.join(__dirname, './data');
var dataExpected = readDir(dataDir).reduce(function (res, fileName) {
    setValueByPathInObject(fs.readFileSync(path.join(dataDir, fileName)).toString(), fileName.split('/'), res);
    return res;
}, {});

var hostName = 'http://google.com';

describe('method addUrl', function () {

    it('should accept full list of args', function () {
        var sm = new Sitemap();
        sm.addUrl({
            url: 'http://vk.com',
            changefreq: 'daily',
            priority: '1.0',
            lastmod: new Date('2015/05/03'),
            lastmodWithTime: false,
            lastmodInISO: false
        });

        var result = sm.toXML()[0].xml;
        result.should.equal(dataExpected['full-args.xml']);
    });

    describe('should accept', function () {

        var expected = dataExpected['one-location.xml'];
        var sitemap;

        beforeEach(function () {
            sitemap = new Sitemap();
        });

        afterEach(function () {
            var result = sitemap.toXML()[0].xml;
            result.should.equal(expected);
        });

        it('should accept url as string', function () {
            sitemap.addUrl('http://google.com/page1');
        });

        it('should accept url as object ', function () {
            sitemap.addUrl({url: 'http://google.com/page1'});
        });

        it('should accept url as array of strings ', function () {
            sitemap.addUrl(['http://google.com/page1']);
        });

    });

    describe('lastmod arg', function () {

        it('should set lastmod from lastmodISO', function () {
            var sm = new Sitemap();
            sm.addUrl({
                url: 'http://google.com',
                lastmodISO: '2011-06-27T00:00:00.000Z'
            });
            var result = sm.toXML()[0].xml;
            result.should.equal(dataExpected['lastmodISO.xml']);
        });

    });

    describe('video arg', function () {

        it('should video tag', function () {
            var sm = new Sitemap();
            sm.addUrl({
                url: 'http://test.com',
                video: {
                    title: 'Grilling steaks for summer',
                    description: 'Alkis shows you how to get perfectly done steaks every time',
                    thumbnail_loc: 'http://www.example.com/thumbs/123.jpg',
                    content_loc: 'http://www.example.com/video123.flv'
                }
            });
            var result = sm.toXML()[0].xml;
            result.should.equal(dataExpected['video.xml']);
        });

    });

    describe('invalid arguments', function () {

        var sitemap;

        beforeEach(function () {
            sitemap = new Sitemap();
        });

        it('should throw ChangeFreqInvalidError', function () {
            var invalidChangefreq = {
                url: 'http://test.com',
                changefreq: 'allllways'
            };
            var fn = sitemap.addUrl.bind(sitemap, invalidChangefreq);
            expect(fn).to.throw(errors.ChangeFreqInvalidError);
        });

        it('should throw PriorityInvalidError', function () {
            var fn = sitemap.addUrl.bind(sitemap, {url: 'http://test.com', priority: 1.1});
            expect(fn).to.throw(errors.PriorityInvalidError);

            fn = sitemap.addUrl.bind(sitemap, {url: 'http://test.com', priority: -1.1});
            expect(fn).to.throw(errors.PriorityInvalidError);

            fn = sitemap.addUrl.bind(sitemap, {url: 'http://test.com', priority: '22'});
            expect(fn).to.throw(errors.PriorityInvalidError);
        });

        it('should throw NoURLError', function () {
            expect(sitemap.addUrl.bind(sitemap)).to.throw(errors.NoURLError);
            expect(sitemap.addUrl.bind(sitemap, {url: ''})).to.throw(errors.NoURLError);
            expect(sitemap.addUrl.bind(sitemap, [{}])).to.throw(errors.NoURLError);
        });

        it('should throw NoURLProtocolError', function () {
            var withoutProtocol = {url: 'vk.com'};
            expect(sitemap.addUrl.bind(sitemap, withoutProtocol.url)).to.throw(errors.NoURLProtocolError);
            expect(sitemap.addUrl.bind(sitemap, withoutProtocol)).to.throw(errors.NoURLProtocolError);
            expect(sitemap.addUrl.bind(sitemap, [withoutProtocol])).to.throw(errors.NoURLProtocolError);
        });

        it('should throw VideoNoRequiredFieldsError', function () {
            var fn = sitemap.addUrl.bind(sitemap, {url: 'http://test.com', video: {}});
            expect(fn).to.throw(errors.VideoNoRequiredFieldsError);

            fn = sitemap.addUrl.bind(sitemap, {url: 'http://test.com', video: {title: 'lalala'}});
            expect(fn).to.throw(errors.VideoNoRequiredFieldsError);

            fn = sitemap.addUrl.bind(sitemap, {
                url: 'http://test.com',
                video: {
                    title: 'Grilling steaks for summer',
                    description: 'Alkis shows you how to get perfectly done steaks every time',
                    thumbnail_loc: 'http://www.example.com/thumbs/123.jpg',
                    content_loc: 'http://www.example.com/video123.flv'
                }
            });
            expect(fn).not.to.throw(errors.VideoNoRequiredFieldsError);

        });

    });

});

describe('toXML()', function () {

    it('should correct set deafult values && escape', function () {
        var sm = new Sitemap();
        sm.addUrl('http://ya.ru/view?widget=3&count>2');
        sm.toXML()[0].xml.should.equal(dataExpected['default-values.xml']);
    });

    it('should correct split sitemap with urls count great then limit', function () {
        var sm = new Sitemap({limit: 2, hostName: hostName});
        for (var i = 0; i < 10; i++) {
            sm.addUrl(path.join(hostName, i + ''));
        }

        sm.toXML().forEach(function eachShouldBeEqual(sm) {
            sm.xml.should.equal(dataExpected['multiple-files']['splited-by-limit'][sm.fileName]);
        });

    });

    it('should transform nested sitemap to horizontal structure', function () {
        var sm1 = new Sitemap({hostName: hostName});
        sm1.addUrl('http://google.com/1/page-1');

        var sm2 = new Sitemap({hostName: hostName});
        sm2.addUrl('http://google.com/1/2/page-1');
        sm2.addUrl('http://google.com/1/2/page-2');

        var sm3 = new Sitemap({hostName: hostName});
        sm3.addUrl('http://google.com/1/3/page-1');
        sm3.addUrl('http://google.com/1/3/page-2');

        var sm4 = new Sitemap({hostName: hostName});
        sm4.addUrl('http://google.com/2/4/page-1');
        sm4.addUrl('http://google.com/2/4/page-2');

        sm1.addSitemap(sm2);
        sm1.addSitemap(sm3);
        sm2.addSitemap(sm4);

        sm1.toXML().forEach(function eachShouldBeEqual(sm) {
            sm.xml.should.equal(dataExpected['multiple-files']['horizontal-structure'][sm.fileName]);
        });

    });

});
