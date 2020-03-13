//=============================================================================
// AXL_BattleExtraText.js
//=============================================================================

/*:
 * @plugindesc Displays a Text Message in the Battle Scene, right on top of the Status Window.
 * @author ElectricAxel
 *
 * @param Message
 * @desc The message that will be displayed in battle. Can use the \v[#] syntax to lookup Control Variables.
 * @default Control Variable 1's value is \v[1].
 *
 * @help
 * ============
 * Introduction
 * ============
 *
 * This simple plugin is just for displaying a message right above the Status Screen during battles.
 * You can also use \v[#] to display variables like Show Text does.
 *
 */

(function () {
  var parameters = PluginManager.parameters("AXL_BattleExtraText");
  var message =
    String(parameters["Message"]) || "Control Variable 1's value is \\v[1].";

  var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function () {
    _Scene_Battle_createAllWindows.call(this);
    var sprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
    this.addChild(sprite);
    sprite.bitmap.drawText(
      message.replace(/\\v\[(\d+)\]/g, function (str, p1) {
        return $gameVariables.value(parseInt(p1));
      }),
      /* Window.prototype.margin */ 4 + Window_Base.prototype.textPadding(),
      Graphics.height - Window_Base.prototype.fittingHeight(5),
      Graphics.width,
      Window_Base.prototype.lineHeight(),
      "left"
    );
  };
})();
