// LabelSettings stores the visual information used by a Labels object to draw itself.
function LabelSettings(attrs) {
  this.leftMargin = attrs.leftMargin || LabelSettings.DEFAULT_MARGIN;
  this.rightMargin = attrs.rightMargin || LabelSettings.DEFAULT_MARGIN;
  this.color = attrs.color || LabelSettings.DEFAULT_COLOR;
  this.font = attrs.font || LabelSettings.DEFAULT_FONT;
  this.opacity = attrs.opacity || 1;
}

LabelSettings.DEFAULT_MARGIN = 10;
LabelSettings.DEFAULT_COLOR = '#999';
LabelSettings.DEFAULT_FONT = '10px sans-serif';

LabelSettings.prototype.margin = function() {
  return this.leftMargin + this.rightMargin;
};

LabelSettings.prototype.equals = function(s) {
  return this.leftMargin === s.leftMargin && this.rightMargin === s.rightMargin &&
    this.color === s.color && this.font === s.font && this.opacity === s.opacity;
};

// Labels represents a group of vertically-stacked labels, each backed by a numerical value.
function Labels(text, values, settings) {
  if (!Array.isArray(text) || !Array.isArray(values) || text.length !== values.length ||
      text.length < 2) {
    throw new Error('invalid arguments');
  }
  this.text = text;
  this.values = values;
  this.settings = settings;

  this._width = 0;
  for (var i = 0, len = text.length; i < len; ++i) {
    this._width = Math.max(this._width, Labels.measureLabel(text[i], this.settings.font));
  }
  this._width += this.settings.margin();
}

Labels.widthContext = document.createElement('canvas').getContext('2d');

Labels.measureLabel = function(text, font) {
  Labels.widthContext.font = font;
  return Labels.widthContext.measureText(text).width;
};

Labels.prototype.width = function() {
  return this._width;
};

Labels.prototype.equals = function(labels) {
  if (this.text.length !== labels.text.length || this._width !== labels._width) {
    return false;
  } if (!this.settings.equals(labels.settings)) {
    return false;
  }
  for (var i = 0, len = this.text.length; i < len; ++i) {
    if (this.text[i] !== labels.text[i] || this.values[i] !== labels.values[i]) {
      return false;
    }
  }
  return true;
};

Labels.prototype.maxValue = function() {
  return this.values[this.values.length-1];
};

Labels.prototype.draw = function(ctx, leftX, topY, bottomY) {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'end';
  ctx.font = this.settings.font;
  ctx.fillStyle = this.settings.color;

  var oldAlpha = ctx.globalAlpha;
  ctx.globalAlpha *= this.settings.opacity;

  var count = this.text.length;
  var spacing = (bottomY - topY) / (count - 1);
  for (var i = 0; i < count; ++i) {
    var y = bottomY - spacing*i;
    ctx.fillText(this.text[i], y, leftX+this._width-this.settings.rightMargin);
  }

  ctx.globalAlpha = oldAlpha;
};

exports.Labels = Labels;