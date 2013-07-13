// ES6-shim 0.7.0 (c) 2013 Paul Miller (paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

var arePropertyDescriptorsSupported = function () {
  var attempt = function () {
    Object.defineProperty({}, 'x', {});
    return true;
  };
  var supported = false;
  try { supported = attempt(); }
  catch (e) { /* this is IE 8. */ }
  return supported;
};

var main = function() {
  'use strict';

  var globals = (typeof global === 'undefined') ? window : global;
  var global_isFinite = globals.isFinite;
  var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();

  // Define configurable, writable and non-enumerable props
  // if they don’t exist.
  var defineProperties = function(object, map) {
    Object.keys(map).forEach(function(name) {
      var method = map[name];
      if (name in object) return;
      if (supportsDescriptors) {
        Object.defineProperty(object, name, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: method
        });
      } else {
        object[name] = method;
      }
    });
  };

  var ES = {
    ToInt32: function(x) {
      return x >> 0;
    },

    ToUint32: function(x) {
      return x >>> 0;
    }
  };

  defineProperties(String, {

    raw: function() {
      var callSite = arguments[0];
      var substitutions = Array.prototype.slice.call(arguments, 1);
      var cooked = Object(callSite);
      var rawValue = cooked.raw;
      var raw = Object(rawValue);
      var len = Object.keys(raw).length;
      var literalsegments = ES.ToUint32(len);
      if (literalsegments === 0) {
        return '';
      }

      var stringElements = [];
      var nextIndex = 0;
      var nextKey, next, nextSeg, nextSub;
      while (nextIndex < literalsegments) {
        nextKey = String(nextIndex);
        next = raw[nextKey];
        nextSeg = String(next);
        stringElements.push(nextSeg);
        if (nextIndex + 1 >= literalsegments) {
          break;
        }
        next = substitutions[nextKey];
        if (typeof next === 'undefined') {
          break;
        }
        nextSub = String(next);
        stringElements.push(nextSub);
        nextIndex++;
      }
      return stringElements.join('');
    }
  });

  defineProperties(String.prototype, {
    // Fast repeat, uses the `Exponentiation by squaring` algorithm.
    // alternative - return new Array(times + 1).join(s);
    repeat: function(times) {
      times = Number.toInteger(times);
      if (times < 0 || times === Infinity) {
        throw new RangeError();
      }
      var s = String(this);
      if (times < 1) return '';
      if (times % 2) return s.repeat(times - 1) + s;
      var half = s.repeat(times / 2);
      return half + half;
    },

    startsWith: function(searchString) {
      var position = arguments[1];
      var searchStr = searchString.toString();
      var s = String(this);
      var pos = (position === undefined) ? 0 : Number.toInteger(position);
      var len = s.length;
      var start = Math.min(Math.max(pos, 0), len);
      var searchLength = searchString.length;
      if ((searchLength + start) > len) return false;
      var index = ''.indexOf.call(s, searchString, start);
      return index === start;
    },

    endsWith: function(searchString) {
      var endPosition = arguments[1];
      var s = String(this);
      var searchStr = searchString.toString();
      var len = s.length;
      var pos = (endPosition === undefined) ?
        len : Number.toInteger(endPosition);
      var end = Math.min(Math.max(pos, 0), len);
      var searchLength = searchString.length;
      var start = end - searchLength;
      if (start < 0) return false;
      var index = ''.indexOf.call(s, searchString, start);
      return index === start;
    },

    contains: function(searchString) {
      var position = arguments[1];

      // Somehow this trick makes method 100% compat with the spec.
      return ''.indexOf.call(this, searchString, position) !== -1;
    },

    codePointAt: function(pos) {
      var s = String(this);
      var position = Number.toInteger(pos);
      var length = s.length;
      if (position < 0 || position >= length) return undefined;
      var first = s.charCodeAt(position);
      var isEnd = (position + 1 === length);
      if (first < 0xD800 || first > 0xDBFF || isEnd) return first;
      var second = s.charCodeAt(position + 1);
      if (second < 0xDC00 || second > 0xDFFF) return first;
      return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
    }
  });

  defineProperties(Array, {
    from: function(iterable) {
      var mapFn = arguments[1];
      var thisArg = arguments[2];

      var list = Object(iterable);
      var length = ES.ToUint32(list.length);
      var result = typeof this === 'function' ?
        Object(new this(length)) : new Array(length);

      for (var i = 0; i < length; i++) {
        var value = list[i];
        result[i] = mapFn ? mapFn.call(thisArg, value) : value;
      }

      result.length = length;
      return result;
    },

    of: function() {
      return Array.from(arguments);
    }
  });

  defineProperties(Array.prototype, {
    find: function(predicate) {
      var list = Object(this);
      var length = ES.ToUint32(list.length);
      if (length === 0) return undefined;
      if (typeof predicate !== 'function') {
        throw new TypeError('Array#find: predicate must be a function');
      }
      var thisArg = arguments[1];
      for (var i = 0, value; i < length && i in list; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) return value;
      }
      return undefined;
    },

    findIndex: function(predicate) {
      var list = Object(this);
      var length = ES.ToUint32(list.length);
      if (length === 0) return -1;
      if (typeof predicate !== 'function') {
        throw new TypeError('Array#findIndex: predicate must be a function');
      }
      var thisArg = arguments[1];
      for (var i = 0, value; i < length && i in list; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) return i;
      }
      return -1;
    }
  });

  defineProperties(Number, {
    MAX_INTEGER: 9007199254740991,
    EPSILON: 2.220446049250313e-16,

    parseInt: globals.parseInt,
    parseFloat: globals.parseFloat,

    isFinite: function(value) {
      return typeof value === 'number' && global_isFinite(value);
    },

    isInteger: function(value) {
      return Number.isFinite(value) &&
        value >= -9007199254740992 && value <= Number.MAX_INTEGER &&
        Math.floor(value) === value;
    },

    isNaN: function(value) {
      return Object.is(value, NaN);
    },

    toInteger: function(value) {
      var number = +value;
      if (Object.is(number, NaN)) return +0;
      if (number === 0 || !Number.isFinite(number)) return number;
      return Math.sign(number) * Math.floor(Math.abs(number));
    }
  });

  defineProperties(Object, {
    getOwnPropertyKeys: function(subject) {
      return Object.keys(subject);
    },

    is: function(x, y) {
      if (x === y) {
        // 0 === -0, but they are not identical.
        if (x === 0) {
          return 1 / x === 1 / y;
        } else {
          return true;
        }
      }

      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      // isNaN is broken: it converts its argument to number, so
      // isNaN('foo') => true
      return x !== x && y !== y;
    }
  });
  
};

if (!Object.isExtensible) {
   Object.isExtensible = function isExtensible(object) {
      // 1. If Type(O) is not Object throw a TypeError exception.
      if (Object(object) !== object) {
         throw new TypeError(); // TODO message
      }
      // 2. Return the Boolean value of the [[Extensible]] internal property of O.
      var name = '';
      while (owns(object, name)) {
         name += '?';
      }
      object[name] = true;
      var returnValue = owns(object, name);
      delete object[name];
      return returnValue;
   };
}

if (typeof define === 'function' && typeof define.amd == 'object' && define.amd) {
  define(main); // RequireJS
} else {
  main(); // CommonJS and <script>
}

if (!String.prototype.format) {
   String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
         return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
      });
   };
}
