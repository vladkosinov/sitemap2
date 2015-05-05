'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x6,
    property = _x7,
    receiver = _x8; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var NoURLError = (function (_Error) {
    function NoURLError() {
        var message = arguments[0] === undefined ? 'URL is required' : arguments[0];

        _classCallCheck(this, NoURLError);

        _get(Object.getPrototypeOf(NoURLError.prototype), 'constructor', this).call(this, message, 'NoURLError');
    }

    _inherits(NoURLError, _Error);

    return NoURLError;
})(Error);

exports.NoURLError = NoURLError;

var NoURLProtocolError = (function (_Error2) {
    function NoURLProtocolError() {
        var message = arguments[0] === undefined ? 'protocol is required' : arguments[0];

        _classCallCheck(this, NoURLProtocolError);

        _get(Object.getPrototypeOf(NoURLProtocolError.prototype), 'constructor', this).call(this, message, 'NoURLProtocolError');
    }

    _inherits(NoURLProtocolError, _Error2);

    return NoURLProtocolError;
})(Error);

exports.NoURLProtocolError = NoURLProtocolError;

var ChangeFreqInvalidError = (function (_Error3) {
    function ChangeFreqInvalidError() {
        var message = arguments[0] === undefined ? 'changefreq is invalid' : arguments[0];

        _classCallCheck(this, ChangeFreqInvalidError);

        _get(Object.getPrototypeOf(ChangeFreqInvalidError.prototype), 'constructor', this).call(this, message, 'ChangeFreqInvalidError');
    }

    _inherits(ChangeFreqInvalidError, _Error3);

    return ChangeFreqInvalidError;
})(Error);

exports.ChangeFreqInvalidError = ChangeFreqInvalidError;

var PriorityInvalidError = (function (_Error4) {
    function PriorityInvalidError() {
        var message = arguments[0] === undefined ? 'priority is invalid' : arguments[0];

        _classCallCheck(this, PriorityInvalidError);

        _get(Object.getPrototypeOf(PriorityInvalidError.prototype), 'constructor', this).call(this, message, 'PriorityInvalidError');
    }

    _inherits(PriorityInvalidError, _Error4);

    return PriorityInvalidError;
})(Error);

exports.PriorityInvalidError = PriorityInvalidError;

var VideoNoRequiredFieldsError = (function (_Error5) {
    function VideoNoRequiredFieldsError() {
        var message = arguments[0] === undefined ? 'fields [' + _utils2['default'].join(', ') + '] are required' : arguments[0];

        _classCallCheck(this, VideoNoRequiredFieldsError);

        _get(Object.getPrototypeOf(VideoNoRequiredFieldsError.prototype), 'constructor', this).call(this, message, 'VideoNoRequiredFieldsError');
    }

    _inherits(VideoNoRequiredFieldsError, _Error5);

    return VideoNoRequiredFieldsError;
})(Error);

exports.VideoNoRequiredFieldsError = VideoNoRequiredFieldsError;