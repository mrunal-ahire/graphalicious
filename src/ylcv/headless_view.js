//deps includes.js

// HeadlessView manages the ChunkView, y-axis labels, animations, and lazy loading.
// It does not concern itself with drawing the content.
function HeadlessView(config) {
  EventEmitter.call(this);

  this._config = config;

  this._width = 0;
  this._height = 0;

  this._chunkView = null;
  this._steadyState = new InstantaneousState(null, new window.scrollerjs.State(0, 0, 0), 0);

  this._animate = false;
  this._animating = false;
  this._animationStartState = null;
  this._animationCurrentState = null;

  this._needsLeftmostChunk = false;
  this._loadingLeftmostChunk = false;
  this._requestedLeftmostChunkLength = 0;

  this._needsCurrentChunk = false;
  this._loadingCurrentChunk = false;
  this._requestedCurrentChunkRange = null;

  this._registerDataSourceEvents();
  this._registerViewEvents();
  this._registerVisualStyleEvents();

  this._boundAnimationFrame = this._handleAnimationFrame.bind(this);
  this._boundAnimationEnd = this._handleAnimationEnd.bind(this);
}

// LEFTMOST_BUFFER is the number of extra pixels worth of data to load
// for the leftmost chunk.
HeadlessView.LEFTMOST_BUFFER = 2000;

// CURRENT_BUFFER is the number of pixels to the left and right of the
// current chunk to load.
HeadlessView.CURRENT_BUFFER = 2000;

// MIN_CURRENT_BUFFER is the minimum number of pixels to the left or right
// of the current chunk before it should be proactively reloaded.
HeadlessView.MIN_CURRENT_BUFFER = 1000;

// SMALL_GAP_WIDTH is used to close "gaps" to the left and right of the current
// chunk.
// If the chunk view would be within SMALL_GAP_WIDTH of the left or right of the
// content, it will be extended to go all the way.
HeadlessView.SMALL_GAP_WIDTH = 100;

HeadlessView.prototype = Object.create(EventEmitter.prototype);

// layout updates the state based on a new width and height.
HeadlessView.prototype.layout = function(w, h) {
  w = Math.ceil(w);
  h = Math.ceil(h);
  if (this._width === w && this._height === h) {
    return;
  }

  this._width = w;
  this._height = h;

  if (this._animating) {
    this._chunkView.finishAnimation();
  }

  // TODO: recompute the scroll state.
  // TODO: recompute the y-axis labels and leftmost labels.
  // TODO: trigger potential reloads for the leftmost chunk and the content chunk.
};

// dispose removes any registered event listeners.
HeadlessView.prototype.dispose = function() {
  this._deregisterDataSourceEvents();
  this._deregisterViewEvents();
  this._deregisterVisualStyleEvents();
  if (this._animating) {
    this._cancelAnimation();
  }
};

// setScrolledPixels updates the scroll state and may trigger a complex chain of events.
HeadlessView.prototype.setScrolledPixels = function(p) {
  // TODO: update the scroll state.
  // TODO: recompute the y-axis labels.
  // TODO: trigger potential reloads for the leftmost chunk and the content chunk.
};

// getAnimate returns the animate flag.
// See setAnimate() for more.
HeadlessView.prototype.getAnimate = function() {
  return this._animate;
};

// setAnimate updates the animate flag.
// The animate flag is used to determine whether or not the current
// ChunkView should animate data source changes.
HeadlessView.prototype.setAnimate = function(flag) {
  this._animate = flag;
};

// chunkView returns the current ChunkView.
// This may be null if no content can be shown, but that is not guaranteed.
HeadlessView.prototype.chunkView = function() {
  return this._chunkView;
};

// instantaneousState returns the InstantaneousState of this view.
// This may be null if no content can be shown, but that is not guaranteed.
HeadlessView.prototype.instantaneousState = function() {
  if (!this._animating) {
    return this._steadyState;
  } else {
    return this._animationCurrentState;
  }
};

// shouldShowContent returns a boolean indicating whether or not the
// view's state is sufficient for presenting data to the user.
HeadlessView.prototype.shouldShowContent = function() {
  return this._chunkView !== null && !this._needsLeftmostChunk;
};

HeadlessView.prototype._cancelAnimation = function() {
  assert(this._animating);
  this._animating = false;
  this._animationStartState = null;
  this._animationCurrentState = null;
  this._deregisterAnimationEvents();
  this._chunkView.finishAnimation();
};

HeadlessView.prototype._registerDataSourceEvents = function() {
  this._boundDataSourceListeners = {};
  var dataSource = this._config.dataSource;
  var events = ['load', 'error', 'delete', 'insert', 'modify', 'invalidate'];
  for (var i = 0, len = events.length; i < len; ++i) {
    var eventName = events[i];
    var capName = eventName[0].toUpperCase() + eventName.substr(1);
    var listener = this['_dataSource' + capName].bind(this);
    this._boundDataSourceListeners[eventName] = listener;
    dataSource.on(eventName, listener);
  }
};

HeadlessView.prototype._deregisterDataSourceEvents = function() {
  var dataSource = this._config.dataSource;
  var keys = Object.keys(this._boundDataSourceListeners);
  for (var i = 0, len = keys.length; i < len; ++i) {
    var key = keys[i];
    dataSource.removeListener(key, this._boundDataSourceListeners[key]);
  }
};

HeadlessView.prototype._dataSourceLoad = function(chunkIndex) {
  // TODO: cancel the current animation.
  // TODO: either create the chunk view or set the leftmost label width.
  // TODO: recompute the scroll state (incase the leftmost width changed).
  // TODO: recompute the current chunk view.
  // TODO: recompute the current y-axis labels.
  this.emit('change');
};

HeadlessView.prototype._dataSourceError = function(chunkIndex) {
  // TODO: reflect the error in our instance variables.
  this.emit('change');
};

HeadlessView.prototype._dataSourceDelete = function(oldIndex) {
  // TODO: cancel current animation.
  // TODO: save the current state as the animation start.
  // TODO: recompute the new state using the style.
  // TODO: tell the ChunkView about the change, and perhaps animate.
  // TODO: if animating, register animation events on the ChunkView.
  this.emit('change');
};

HeadlessView.prototype._dataSourceInsert = function(index) {
  // TODO: see _dataSourceDelete() for basic steps.
  this.emit('change');
};

HeadlessView.prototype._dataSourceModify = function(index) {
  // TODO: see _dataSourceDelete() for basic steps.
  this.emit('change');
};

HeadlessView.prototype._dataSourceInvalidate = function() {
  // TODO: start reloading everything and scroll to the far right.
  this.emit('change');
};

HeadlessView.prototype._registerViewEvents = function() {
  this._boundRetry = this._retry.bind(this);
  this._config.loader1.on('retry', this._boundRetry);
  this._config.loader2.on('retry', this._boundRetry);
  this._config.splashScreen.on('retry', this._boundRetry);
};

HeadlessView.prototype._deregisterViewEvents = function() {
  this._config.loader1.removeListener('retry', this._boundRetry);
  this._config.loader2.removeListener('retry', this._boundRetry);
  this._config.splashScreen.removeListener('retry', this._boundRetry);
};

HeadlessView.prototype._retry = function() {
  // TODO: retry any loads that failed in the past.
};

HeadlessView.prototype._registerVisualStyleEvents = function() {
  this._boundHandleMetricChange = this._handleMetricChange.bind(this);
  this._config.visualStyle.on('metricChange', this._boundHandleMetricChange);
};

HeadlessView.prototype._deregisterVisualStyleEvents = function() {
  this._config.visualStyle.removeListener('metricChange', this._boundHandleMetricChange);
};

HeadlessView.prototype._handleMetricChange = function() {
  // TODO: scroll to the right.
  // TODO: update the leftmost labels and y-axis labels.
  // TODO: trigger potential reloads.
  this.emit('change');
};

HeadlessView.prototype._registerChunkViewEvents = function() {
  this._chunkView.on('animationFrame', this._boundAnimationFrame);
  this._chunkView.on('animationEnd', this._boundAnimationEnd);
};

HeadlessView.prototype._deregisterAnimationEvents = function() {
  assert(this._animating);
  this._chunkView.removeListener('animationFrame', this._boundAnimationFrame);
  this._chunkView.removeListener('animationEnd', this._boundAnimationEnd);
};

HeadlessView.prototype._handleAnimationFrame = function(progress) {
  this._animationCurrentState = this._animationStartState.transitionFrame(this._steadyState,
    progress, this._chunkView.getEncompassingWidth());
  this.emit('change');
};

HeadlessView.prototype._handleAnimationEnd = function() {
  this._animating = false;
  this._animationStartState = null;
  this._animationCurrentState = null;
  this._deregisterAnimationEvents();
};