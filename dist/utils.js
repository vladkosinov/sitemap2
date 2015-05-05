'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

/**
 *  Pads the left-side of a string with a specific
 *  set of characters.
 *
 *  @param {Object} n
 *  @param {Number} len
 *  @param {String} chr
 */
exports.lpad = lpad;
exports.chunkArray = chunkArray;
exports.validateChangeFreq = validateChangeFreq;
exports.validateURL = validateURL;
exports.validatePriority = validatePriority;
exports.validateLastMod = validateLastMod;
exports.validateVideo = validateVideo;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _errors = require('./errors');

var parseURL = _url2['default'].parse.bind(_url2['default']);
function lpad(n, len) {
    var chr = arguments[2] === undefined ? '0' : arguments[2];

    var res = n.toString();
    while (res.length < len) {
        res = chr + res;
    }
    return res;
}

function chunkArray(array, chunkSize) {
    var sum = [];
    for (var i = 0; i < array.length; i += chunkSize) {
        sum.push(array.slice(i, i + chunkSize));
    }
    return sum;
}

function validateChangeFreq(changefreq) {
    var isValid = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].indexOf(changefreq) !== -1;
    if (!isValid) {
        throw new _errors.ChangeFreqInvalidError();
    }
    return changefreq;
}

function validateURL(url) {
    if (!url) {
        throw new _errors.NoURLError();
    }
    if (!parseURL(url).protocol) {
        throw new _errors.NoURLProtocolError();
    }
    return url;
}

function validatePriority(priority) {
    priority = +priority;
    if (!(priority >= 0 && priority <= 1)) {
        throw new _errors.PriorityInvalidError();
    }
    return priority;
}

function validateLastMod(lastmod) {
    var lastmodISO = arguments[1] === undefined ? false : arguments[1];

    if (lastmodISO) {
        return lastmodISO;
    }
    // append the timezone offset so that dates are treated as local time.
    // Otherwise the Unit tests fail sometimes.
    var timezoneOffset = 'UTC-' + new Date().getTimezoneOffset() / 60 + '00';
    var dt = new Date(lastmod + ' ' + timezoneOffset);
    return [dt.getFullYear(), lpad(dt.getMonth() + 1, 2), lpad(dt.getDate(), 2)].join('-');
}

var VIDEO_REQUIRED_FIELDS = ['title', 'description', 'thumbnail_loc', 'content_loc'];
exports.VIDEO_REQUIRED_FIELDS = VIDEO_REQUIRED_FIELDS;

function validateVideo(videoTag) {

    var requiredFieldsExist = VIDEO_REQUIRED_FIELDS.every(function (e) {
        return videoTag[e];
    });
    if (!requiredFieldsExist) {
        throw new _errors.VideoNoRequiredFieldsError();
    }
    return videoTag;
}