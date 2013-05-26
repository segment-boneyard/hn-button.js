describe('hn-button.js', function () {

  var HN
    , assert = require('component-assert')
    , type = require('component-type');

  it('should convert links on initialize', function () {
    assert(document.querySelector('.hn-button').tagName === 'A');
    HN = require('hn-button.js');
    assert(document.querySelector('.hn-button').tagName === 'IFRAME');
  });

  it('should have an on method', function () {
    assert(type(HN.on) === 'function');
  });

  it('should have an once method', function () {
    assert(type(HN.once) === 'function');
  });

  it('should have an off method', function () {
    assert(type(HN.off) === 'function');
  });

  it('should have an emit method', function () {
    assert(type(HN.emit) === 'function');
  });

});