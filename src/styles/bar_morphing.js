function MorphingBarLandscape(info) {
  this._pointCount = info.pointCount;
  this._attrs = info.attrs;
  this._morphingIndex = info.morphingIndex;
  this._morphingVisibility = info.morphingVisibility || 0;
}

MorphingBarLandscape.prototype.computeRange = function(region) {
  var leadingSpacing = this._leadingSpacing();

  var startIndex = 0;
  if (region.left < leadingSpacing - this._morphingBarSpacing()) {
    // NOTE: we have to use Math.min() because the regular attrs might report an index of
    // this._morphingIndex since the morphing bar spacing is smaller than the regular bar spacing.
    startIndex = Math.min(this._attrs.computeRange(region, this._pointCount).startIndex,
      this._morphingIndex-1);
  } else if (region.left >= leadingSpace + this._morphingBarWidth()) {
    var shift = leadingSpace + this._morphingBarWidth() + this._morphingBarSpacing() +
      this._attrs.getBarWidth();
    if (region.left < shift) {
      startIndex = this._morphingIndex + 1;
    } else {
      var shifted = region.left - shift;
      startIndex = this._morphingIndex + 2 +
        Math.floor(shifted/(this._attrs.getBarWidth()+this._attrs.getBarSpacing()));
    }
  } else {
    startIndex = this._morphingIndex;
  }

  var endIndex = 0;
  var right = region.left + region.width;
  if (right < leadingSpacing) {
    var finalRange = this._attrs.computeRange(region, this._pointCount);
    endIndex = finalRange.startIndex + finalRange.length;
  } else if (right < leadingSpacing + this._morphingBarWidth() + this._morphingBarSpacing()) {
    endIndex = this._morphingIndex + 1;
  } else {
    var shifted = right - (leadingSpacing + this._morphingBarWidth() + this._morphingBarSpacing());
    endIndex = this._morphingIndex + 2 +
      Math.floor(shifted/(this._attrs.getBarWidth()+this._attrs.getBarSpacing()));
  }

  return {
    startIndex: Math.max(0, Math.min(this._pointCount-1, startIndex)),
    length: Math.max(0, Math.min(this._pointCount-startIndex, endIndex - startIndex))
  };
};

MorphingBarLandscape.prototype.computeRegion = function(range) {
  // TODO: this.
};

// _width returns the width of the complete morphing landscape.
MorphingBarLandscape.prototype._width = function() {
  var biggerWidth = this._attrs.computeRegion({startIndex: 0, length: this._pointCount},
    this._pointCount).width;
  var smallerWidth = this._attrs.computeRegion({startIndex: 0, length: this._pointCount-1},
    this._pointCount-1).width;
  return this._morphingVisibility*biggerWidth + (1-this._morphingVisibility)*smallerWidth;
};

// _leadingSpace returns the number of pixels before the first pixel of the morphing bar.
MorphingBarLandscape.prototype._leadingSpacing = function() {
  if (this._morphingIndex === 0) {
    return this._attrs.getLeftMargin();
  } else if (this._morphingIndex === this._pointCount-1) {
    return this._attrs.computeRegion({startIndex: 0, length: this._pointCount},
      this._pointCount).width - this._attrs.getRightMargin() - this._morphingBarWidth();
  }
  return this._attrs.getLeftMargin() + this._morphingIndex*this._attrs.getBarWidth() +
    (this._morphingIndex-1)*this._attrs.getBarSpacing() +
    (0.5+0.5*this._morphingVisibility)*this._attrs.getBarSpacing();
};

MorphingBarLandscape.prototype._morphingBarWidth = function() {
  if (this._morphingIndex === 0 || this._morphingIndex === this._pointCount-1) {
    var y = this._attrs.getBarWidth() + this._attrs.getBarSpacing();
    return Math.max(0, this._morphingVisibility*y - this._attrs.getBarSpacing());
  }
  return this._morphingVisibility * this._attrs.getBarWidth();
};

MorphingBarLandscape.prototype._morphingBarSpacing = function() {
  return (1 + this._morphingVisibility) * this._attrs.getBarSpacing() / 2;
};