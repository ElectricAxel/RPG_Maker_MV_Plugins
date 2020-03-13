//=============================================================================
// AXL_VolumeSlider.js
//=============================================================================

/*:
 * @plugindesc Changes the Volume Options into Sliders.
 * @author ElectricAxel
 *
 * @help This plugin does not provide plugin commands and has no parameters.
 */

(function () {
  /**
   * Copy paste of the draw item with an added condition for the sliders.
   */
  Window_Options.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var statusWidth = this.statusWidth();
    var titleWidth = rect.width - statusWidth;
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, "left");

    var symbol = this.commandSymbol(index);
    if (!this.isVolumeSymbol(symbol)) {
      this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, "right");
    } else {
      var symbol = this.commandSymbol(index);

      this.drawSlider(this.getConfigValue(symbol), titleWidth, rect.y, statusWidth);
    }
  };

  /**
   * Copy paste of the onTouch to be able to get the location of the mouse and
   *  use it for the sliders only when it's volume symbols.
   */
  Window_Options.prototype.onTouch = function (triggered) {
    var lastIndex = this.index();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest(x, y);
    if (hitIndex >= 0) {
      if (hitIndex === this.index()) {
        var symbol = this.commandSymbol(hitIndex);
        if (this.isVolumeSymbol(symbol)) {
          var rect = this.itemRectForText(hitIndex);
          var statusWidth = this.statusWidth();
          var titleWidth = rect.width - statusWidth + 20;

          if (x >= titleWidth && x <= titleWidth + statusWidth) {
            this.changeValue(symbol, Math.round(((x - titleWidth) / statusWidth) * 100));
          }
        } else if (triggered && this.isTouchOkEnabled()) {
          this.processOk();
        }
      } else if (this.isCursorMovable()) {
        this.select(hitIndex);
      }
    } else if (this._stayCount >= 10) {
      if (y < this.padding) {
        this.cursorUp();
      } else if (y >= this.height - this.padding) {
        this.cursorDown();
      }
    }
    if (this.index() !== lastIndex) {
      SoundManager.playCursor();
    }
  };

  /**
   * Draws a bar with the given position and width,
   * and then draws a slightly bigger square on a position based on the Value.
   *
   * @param value A value between 0 and 100 which is how far along the bar the square will be drawn.
   * @param x Horizontal position of the bar.
   * @param y Vertical position of the bar.
   * @param width Horizontal size of the bar.
   */
  Window_Options.prototype.drawSlider = function (value, x, y, width) {
    value = value.clamp(0, 100);
    var lineY = y + this.lineHeight() / 2;

    this.contents.paintOpacity = 100;

    this.contents.fillRect(x, lineY, width - 1, 2, this.normalColor());

    var position = (this.statusWidth() * value) / 100;

    this.contents.fillRect(x + position, lineY - 5, 4, 10, this.contents.textColor);

    this.contents.paintOpacity = 255;
  };
})();
