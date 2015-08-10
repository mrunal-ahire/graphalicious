//deps event_emitter.js

// ScrollView provides the user interface for scrolling around within content.
function ScrollView(canvas, colorScheme) {
  EventEmitter.prototype.call(this);

  this._canvas = canvas;
  this._colorScheme = colorScheme;

  this._drawSetsToTrue = false;

  this._scrollbarAnimation = null;
  this._scrolls = false;

  this._offscreenWidth = 0;
  this._contentWidth = 0;
  this._amountScrolled = 0;

  this._registerEvents();
}

ScrollView.ANIMATION_DURATION = 0.4;
ScrollView.SCROLLBAR_HEIGHT = 5;
ScrollView.SCROLLBAR_MARGIN = 5;

// contentViewport returns a Viewport into which content may be drawn.
ScrollView.prototype.contentViewport = function() {
  var mainViewport = this._canvas.viewport();
  var totalPossibleUsedHeight = ScrollView.SCROLLBAR_HEIGHT + ScrollView.SCROLLBAR_MARGIN;
  var usedHeight = Math.round(this._fractionShowingScrollbar() * totalPossibleUsedHeight);
  return mainViewport.containedViewport(0, 0, mainViewport.width(),
    mainViewport.height()-usedHeight);
};

// disableScrolling makes the ScrollView unscrollable.
// The scrollbar will be hidden and scroll-wheel events will be disabled.
ScrollView.prototype.disableScrolling = function() {
  if (!this._scrolls) {
    return;
  }
  this._scrolls = false;
  this._deregisterScrollingEvents();
  if (this.getAnimationsEnabled() || this._scrollbarAnimation !== null) {
    this._animateScrollbar(0);
  } else {
    this._draw();
  }
};

// enableScrolling makes the ScrollView scrollable.
// In order to present the user with a scrollbar, it is necessary to provide two parameters.
// The contentWidth parameter specifies the width (in pixels) of the underlying content.
// The offscreenWidth parameter specifies the width (in pixels) of the part of the underlying
// content that is not visible at a given time. The scroll view can be scrolled to any point between
// 0 and offscreenWidth pixels.
ScrollView.prototype.enableScrolling = function(contentWidth, offscreenWidth) {
  this._contentWidth = content;
  this._offscreenWidth = offscreen;

  this._scrolls = true;
  this._registerScrollingEvents();
  if (this.getAnimationsEnabled() || this._scrollbarAnimation !== null) {
    this._animateScrollbar(1);
  } else {
    this._draw();
  }
};

// getAnimationsEnabled returns whether or not animations are enabled on the underlying canvas.
ScrollView.prototype.getAnimationsEnabled = function() {
  return this._canvas.getAnimationsEnabled();
};

ScrollView.prototype._animateScrollbar = function(endVal) {
  var startVal = this._fractionShowingScrollbar();
  if (this._scrollbarAnimation !== null) {
    this._scrollbarAnimation.cancel();
  }

  var duration = Math.abs(startVal - endVal) * ScrollView.ANIMATION_DURATION;
  this._scrollbarAnimation = new ValueAnimation(duration, startVal, endVal);
  this._scrollbarAnimation.on('progress', this._draw.bind(this));
  this._scrollbarAnimation.on('done', function() {
    this._scrollbarAnimation = null;
    this._draw();
  }.bind(this));
  this._scrollbarAnimation.start();
};

ScrollView.prototype._deregisterScrollingEvents = function() {
  // TODO: this.
};

ScrollView.prototype._draw = function() {
  this._drawSetsToTrue = true;

  var viewport = this._canvas.viewport();
  viewport.enter();
  viewport.context().clearRect(0, 0, viewport.width(), viewport.height());
  var scrollbarHeight = this._fractionShowingScrollbar * ScrollView.SCROLLBAR_HEIGHT;
  if (scrollbarHeight > 0) {
    this._drawScrollbar(viewport.context(), viewport.height()-scrollbarHeight, viewport.width(),
      scrollbarHeight);
  }
  viewport.leave();

  this.emit('draw');
};

ScrollView.prototype._drawScrollbar = function(context, y, width, height) {
  // TODO: this.
};

ScrollView.prototype._fractionShowingScrollbar = function() {
  if (this._scrollbarAnimation === null) {
    return this._scrollbarVisible ? 1 : 0;
  } else {
    return this._scrollbarAnimation.value();
  }
};

ScrollView.prototype._layout = function() {
  this._drawSetsToTrue = false;
  this.emit('layout');

  // Sometimes a layout handler will do something to cause a _draw(). In those cases, we do not need
  // to do another draw here.
  if (!this._drawSetsToTrue) {
    this._draw();
  }
};

ScrollView.prototype._redrawScrollbar = function() {
  var scrollbarHeight = this._fractionShowingScrollbar * ScrollView.SCROLLBAR_HEIGHT;
  if (scrollbarHeight > 0) {
    var intHeight = Math.ceil(scrollbarHeight);
    var viewport = this._canvas.viewport();
    viewport.enter();
    viewport.context().clearRect(0, viewport.height()-intHeight, viewport.width(), intHeight);
    this._drawScrollbar(viewport.context(), viewport.height()-scrollbarHeight, viewport.width(),
      scrollbarHeight);
    viewport.leave();
  }
};

ScrollView.prototype._registerEvents = function() {
  this._canvas.on('layout', this._layout.bind(this));
  this._colorScheme.on('change', this._redrawScrollbar.bind(this));
};

ScrollView.prototype._registerScrollingEvents = function() {
  // TODO: this.
};
