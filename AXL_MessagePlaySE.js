//=============================================================================
// AXL_MessagePlaySE.js
//=============================================================================

/*:
 * @plugindesc Whenever a message window is closed, a sound effect will be played.
 * @author ElectricAxel
 *
 * @param Name
 * @desc The name of the Sound Effect as it appears in the Play SE event dialog.
 * @default Wolf
 * @type file
 * @dir audio/se
 *
 * @param Volume
 * @desc The volume for the audio playback. The same as it appears in the Play SE event dialog.
 * @default 90
 * @type number
 * @min 0
 * @max 100
 *
 * @param Pitch
 * @desc The pitch for the audio playback. The same as it appears in the Play SE event dialog.
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @param Pan
 * @desc The pan for the audio playback. The same as it appears in the Play SE event dialog.
 * @default 0
 * @type number
 * @min -100
 * @max 100
 *
 * @help
 * ===============
 * Introduction
 * ===============
 *
 * This plugin will play a Sound Effect every time a message window is closed.
 *
 */

(function () {
  //Read the parameters
  var parameters = PluginManager.parameters("AXL_MessagePlaySE");
  var name = parameters["Name"] || "";
  var volume = parseInt(parameters["Volume"]) || 90;
  var pitch = parseInt(parameters["Pitch"]) || 100;
  var pan = parseInt(parameters["Pan"]) || 0;

  var _Window_Message_terminateMessage =
    Window_Message.prototype.terminateMessage;
  Window_Message.prototype.terminateMessage = function () {
    if (
      !$gameMessage.isChoice() &&
      !$gameMessage.isNumberInput() &&
      !$gameMessage.isItemChoice()
    ) {
      AudioManager.playSe({
        name: name,
        volume: volume,
        pitch: pitch,
        pan: pan
      });
    }
    _Window_Message_terminateMessage.call(this);
  };
})();
