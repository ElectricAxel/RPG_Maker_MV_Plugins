//=============================================================================
// AXL_Core.js
//=============================================================================

/*:
 * @plugindesc This contains methods and variables needed by the other Plugins of the AXL library.
 * @author ElectricAxel
 *
 * @param EncounterSpeed
 * @desc New encounter speed. The default value is 60. If you set this to -1, it won't be overwritten.
 * @default -1
 * @type number
 * @min -1
 *
 * @param FadeSpeed
 * @desc New fade speed. The default value is 24. If you set this to -1, it won't be overwritten. Also, setting it to 0 will make it become 30.
 * @default -1
 * @type number
 * @min -1
 *
 * @help
 * ===============
 * Introduction
 * ===============
 *
 * This is the Core for the AXL scripts. Some of them work without it, it'll be specified in the Help if it's necessary.
 * As of writing, it only does 3 things: set up the base for other scripts, set the encounter animation speed if set,
 * and set the fade animation speed if set.
 *
 *
 * ===============
 * Version History
 * ===============
 *
 * -Version 1.1:
 * Help added.
 * EncounterSpeed and FadeSpeed added.
 *
 * -Version 1.0:
 * AXL_Core finished and tested.
 */

//=============================================================================
//BEGIN GLOBAL BLOCK
//this block has to be out here to become global
//=============================================================================
var AXLLib = AXLLib || {};
AXLLib.version = 1.1;
//=============================================================================
//END GLOBAL BLOCK
//=============================================================================

(function () {
  //Read the parameters
  var parameters = PluginManager.parameters("AXL_Core");
  AXLLib.EncounterSpeed = parseInt(parameters["EncounterSpeed"]) || -1;
  AXLLib.FadeSpeed = parseInt(parameters["FadeSpeed"]) || -1;

  //Replace game constructor to save our variables
  var _Game_System_Initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_Initialize.call(this);
    this._AXLVariables = {};
  };

  /**
   * I did not write this method.
   * This will allow us to check if we're in the map scene so we can open text windows.
   *
   * By SumRndmDde
   */
  AXLLib.isOnMap = function () {
    return (
      SceneManager._scene.constructor === Scene_Map &&
      SceneManager._sceneStarted
    );
  };

  if (AXLLib.EncounterSpeed > -1) {
    Scene_Map.prototype.encounterEffectSpeed = function () {
      return AXLLib.EncounterSpeed;
    };
  }

  if (AXLLib.FadeSpeed > -1) {
    Scene_Base.prototype.fadeSpeed = function () {
      return AXLLib.FadeSpeed;
    };
  }
})();
