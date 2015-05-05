export class NoURLError extends Error {
    constructor(message = 'URL is required') {
        super(message, 'NoURLError');
    }
}

export class NoURLProtocolError extends Error {
    constructor(message = 'protocol is required') {
        super(message, 'NoURLProtocolError');
    }
}

export class ChangeFreqInvalidError extends Error {
    constructor(message = 'changefreq is invalid') {
        super(message, 'ChangeFreqInvalidError');
    }
}

export class PriorityInvalidError extends Error {
    constructor(message = 'priority is invalid') {
        super(message, 'PriorityInvalidError');
    }
}
