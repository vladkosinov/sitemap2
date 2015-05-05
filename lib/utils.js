import urlParser from 'url';
import {
    NoURLError,
    NoURLProtocolError,
    ChangeFreqInvalidError,
    PriorityInvalidError
    } from './errors';

let parseURL = urlParser.parse.bind(urlParser);

/**
 *  Pads the left-side of a string with a specific
 *  set of characters.
 *
 *  @param {Object} n
 *  @param {Number} len
 *  @param {String} chr
 */
export function lpad(n, len, chr = '0') {
    let res = n.toString();
    while (res.length < len) {
        res = chr + res;
    }
    return res;
}

export function chunkArray(array, chunkSize) {
    let sum = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        sum.push(array.slice(i, i + chunkSize));
    }
    return sum;
}

export function validateChangeFreq(changefreq) {
    let isValid = [
            'always',
            'hourly',
            'daily',
            'weekly',
            'monthly',
            'yearly',
            'never'].indexOf(changefreq) !== -1;
    if (!isValid) {
        throw new ChangeFreqInvalidError();
    }
    return changefreq;
}

export function validateURL(url) {
    if (!url) {
        throw new NoURLError();
    }
    if (!parseURL(url).protocol) {
        throw new NoURLProtocolError();
    }
    return url;
}

export function validatePriority(priority) {
    priority = +priority;
    if (!(priority >= 0.0 && priority <= 1.0)) {
        throw new PriorityInvalidError();
    }
    return priority;
}

export function validateLastMod(lastmod, lastmodISO = false) {
    if (lastmodISO) {
        return lastmodISO;
    }
    // append the timezone offset so that dates are treated as local time.
    // Otherwise the Unit tests fail sometimes.
    let timezoneOffset = 'UTC-' + (new Date().getTimezoneOffset() / 60) + '00';
    let dt = new Date(lastmod + ' ' + timezoneOffset);
    return [dt.getFullYear(), lpad(dt.getMonth() + 1, 2), lpad(dt.getDate(), 2)].join('-');
}
