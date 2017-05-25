/*!
 * events
 * Version: 0.0.1
 * Date: 2016/8/1
 * https://github.com/ftp/ftp
 *
 * Original Author: https://github.com/aralejs/events
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/ftp/ftp/blob/master/LICENSE
 */

'use strict';

var util = require('./util');
// Array slice
var slice = Array.prototype.slice;

/**
 * Events
 *
 * @constructor
 */
function Events() {
  // Keep this empty so it's easier to inherit from
}

Events.prototype = {
  /**
   * Bind event
   *
   * @param {any} name
   * @param {any} listener
   * @param {any} context
   * @returns {Events}
   */
  on: function(name, listener, context) {
    var self = this;
    var events = self.__events || (self.__events = {});

    context = arguments.length < 3 ? self : context;

    (events[name] || (events[name] = [])).push({
      fn: listener,
      context: context
    });

    return self;
  },
  /**
   * Bind event only emit once
   *
   * @param {any} name
   * @param {any} listener
   * @param {any} context
   * @returns {Events}
   */
  once: function(name, listener, context) {
    var self = this;

    function feedback() {
      self.off(name, feedback);
      util.apply(listener, this, arguments);
    };

    return self.on(name, feedback, context);
  },
  /**
   * Emit event
   *
   * @param {any} name
   * @param {any} [...param]
   * @returns {Events}
   */
  emit: function(name) {
    var context = this;
    var data = slice.call(arguments, 1);
    var events = context.__events || (context.__events = {});
    var listeners = events[name] || [];

    var result;
    var listener;
    var returned;

    // Emit events
    for (var i = 0, length = listeners.length; i < length; i++) {
      listener = listeners[i];
      result = util.apply(listener.fn, listener.context, data);

      if (returned !== false) {
        returned = result;
      }
    }

    return returned;
  },
  /**
   * Remove event
   *
   * @param {any} name
   * @param {any} listener
   * @param {any} context
   * @returns {Events}
   */
  off: function(name, listener, context) {
    var self = this;
    var length = arguments.length;
    var events = self.__events || (self.__events = {});

    switch (length) {
      case 0:
        self.__events = {};
        break;
      case 1:
        delete events[name];
        break;
      default:
        if (listener) {
          var listeners = events[name];

          if (listeners) {
            context = length < 3 ? self : context;
            length = listeners.length;

            var event;

            for (var i = 0; i < length; i++) {
              event = listeners[i];

              if (event.fn === listener && event.context === context) {
                listeners.splice(i, 1);
                break;
              }
            }

            // Remove event from queue to prevent memory leak
            if (!listeners.length) {
              delete events[name];
            }
          }
        }
        break;
    }

    return self;
  }
};

module.exports = Events;
