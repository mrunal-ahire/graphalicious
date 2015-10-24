//deps event_emitter.js

// DraggableView is an abstract base class for views which need to support user dragging.
//
// Subclasses of DraggableView must implement the following two methods:
// - *DOMElement* element() - return the element on which touches should be captured
// - *function(number)* _generateDragFunction(x, y) - generate a function which will be called with
//   x values as the user drags their mouse or finger along the screen. This will be called once for
//   every time the user initiates a drag. All coordinate arguments are in client coordinates. This
//   can return null to cancel the drag.
//
// DraggableView subclasses EventEmitter but does not fire any events.
function DraggableView() {
  EventEmitter.call(this);
  this._registerMouseEvents();
  this._registerTouchEvents();
}

DraggableView.prototype = Object.create(EventEmitter.prototype);

DraggableView.prototype.element = function() {
  throw new Error('subclasses must override element()');
};

DraggableView.prototype._generateDragFunction = function(x, y) {
  throw new Error('subclasses must override _generateDragFunction()');
};

DraggableView.prototype._registerMouseEvents = function() {
  var shielding = document.createElement('div');
  shielding.style.width = '100%';
  shielding.style.height = '100%';
  shielding.style.position = 'fixed';

  var mouseMove, mouseUp;
  var eventCallback = null;

  mouseMove = function(e) {
    eventCallback(e.clientX - this.element().getBoundingClientRect().left);

    // NOTE: this fixes a problem where the cursor becomes an ibeam.
    e.preventDefault();
    e.stopPropagation();
  }.bind(this);

  mouseUp = function() {
    eventCallback = null;
    document.body.removeChild(shielding);
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', mouseUp);
  }.bind(this);

  this.element().addEventListener('mousedown', function(e) {
    if (eventCallback !== null) {
      return;
    }

    var offset = this.element().getBoundingClientRect();
    eventCallback = this._generateDragFunction(e.clientX-offset.left, e.clientY-offset.top);
    if (eventCallback === null) {
      return;
    }

    // NOTE: this fixes a problem where the cursor becomes an ibeam.
    e.preventDefault();
    e.stopPropagation();

    document.body.appendChild(shielding);

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  }.bind(this));
};

DraggableView.prototype._registerTouchEvents = function() {
  var e = this.element();
  var eventCallback = null;

  e.addEventListener('touchstart', function(e) {
    if (eventCallback === null) {
      var touch = e.changedTouches[0];
      var offset = this.element().getBoundingClientRect();
      eventCallback = this._generateDragFunction(touch.clientX-offset.left,
        touch.clientY-offset.top);
      if (eventCallback !== null) {
        e.preventDefault();
      }
    }
  }.bind(this));

  e.addEventListener('touchmove', function(e) {
    if (eventCallback !== null) {
      var offset = this.element().getBoundingClientRect();
      eventCallback(e.changedTouches[0].clientX - offset.left);
    }
  }.bind(this));

  var cancel = function() {
    eventCallback = null;
  }.bind(this);

  e.addEventListener('touchend', cancel);
  e.addEventListener('touchcancel', cancel);
};
