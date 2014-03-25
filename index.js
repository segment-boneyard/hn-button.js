
/**
 * Module dependencies.
 */

var bind = require('bind')
  , each = require('each')
  , Emitter = require('emitter')
  , on = require('event').bind
  , query = require('query')
  , uid = require('uid');


/**
 * The HN object is really just an emitter for listening to button events.
 */

var HN = new Emitter();


/**
 * When an iframe first loads it send along its width, so we can resize the
 * <iframe> in the DOM. This way it never takes up more space than it actually
 * needs, so multiple button in a row are next to each other.
 */

HN.on('load', function (event) {
  var iframe = event.target;
  iframe.width = Math.ceil(event.width); // browsers round weirdly, ceil helps
});


/**
 * Initialize a button element.
 */

HN.initialize = function (a) {
  new Button(a);
};


/**
 * Initialize a button. Generate a unique ID that we can use when messaging
 * between windows to identify the sender.
 *
 * @param {Element} button  The button's element in the DOM.
 */

function Button (a) {
  var host = a.getAttribute('data-host') || 'hn-button.herokuapp.com';
  this.origin = location.protocol + '//' + host;
  this.id = 'hn-button-' + uid();
  on(window, 'message', bind(this, this.onMessage));
  this.render(a);
}


/**
 * Render a button.
 *
 * @param {Element} a  The original <a> element that was on the page.
 */

Button.prototype.render = function (a) {
  // Grab some settings from the <a>.
  var options = {
    title: a.getAttribute('data-title') || document.title,
    url: a.getAttribute('data-url') || window.location.href,
    style: a.getAttribute('data-style'),
    count: a.getAttribute('data-count')
  };

  // Create the iframe element that we will replace the <a> with.
  var iframe = this.iframe = document.createElement('iframe');

  // Set the source based on data attributes, with fallbacks.
  iframe.src = this.origin + stringify(options);

  // Add the id, name, class, and I think it's nice to see the same attributes
  // you set on the <a> stay on the iframe.
  iframe.id = iframe.name = this.id;
  iframe.className = 'hn-button';
  iframe.setAttribute('data-title', options.title);
  iframe.setAttribute('data-url', options.url);
  if (options.style) iframe.setAttribute('data-style', options.style);
  if (options.count) iframe.setAttribute('data-count', options.count);

  // Give it a title for accessibility.
  iframe.title = 'Hacker News Button';

  // Set the proper width and height, depending on the orientation.
  iframe.height = options.count === 'vertical' ? 62 : 20; // standard
  iframe.width = 100; // a best guess, real width applied on load

  // Set other required attributes.
  iframe.frameBorder = 0; // removes default iframe border

  // Replace the <a> with the iframe.
  a.parentNode.insertBefore(iframe, a);
  a.parentNode.removeChild(a);
};


/**
 * Listen for messages coming from our iframe's window and proxy them to the
 * global HN object so others can react.
 *
 * @param {MessageEvent} message  The message from the postMessage API.
 */

Button.prototype.onMessage = function (message) {
  // make sure we're listening for the right thing
  if (message.origin !== this.origin) return;
  if (message.data.id !== this.id) return;

  var event = message.data.event
    , data = message.data.data;

  // add properties so the listener can differentiate
  data.type = event;
  data.id = this.id;
  data.target = this.iframe;

  // emit on the global HN object
  HN.emit(event, data);
};


/**
 * Stringify a querystring from an options dictionary.
 *
 * @param {Object} options  The options to use.
 * @return {String}         The iframe `src` href.
 */

function stringify (options) {
  var query = '';
  each(options, function (key, value) {
    if ('host' == key) return;
    query += query ? '&' : '?';
    if (value) query += key + '=' + encodeURIComponent(value);
  });
  return query;
}


/**
 * Kick everything off, initializing all the `.hn-button`'s on the page.
 */

each(query.all('.hn-button'), HN.initialize);


/**
 * Replay existing queued messages into the real HN object.
 */

if (window.HN) while (window.HN.length > 0) {
  var item = window.HN.shift();
  var method = item.shift();
  if (HN[method]) HN[method].apply(HN, item);
}


/**
 * Module exports.
 */

module.exports = HN;