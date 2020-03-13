//=============================================================================
// AXL_EXP_Items.js
//=============================================================================

/*:
 * @plugindesc Items can grant EXP through a Note.
 * @author ElectricAxel
 *
 * @param EXP Note Name
 * @desc Name of the Note used for the item, ie, <EXP:100> would be EXP.
 * @default EXP
 *
 * @help
 * ===============
 * Introduction
 * ===============
 *
 * This plugin allows items to give EXP to a single Actor. The upside to using
 * a plugin is that it won't close the Menu like Common Events would.
 */

(function () {

  var parameters = PluginManager.parameters("AXL_EXP_Items");
  var noteName = parameters["EXP Note Name"] || "EXP";

  var _Game_Action_hasItemAnyValidEffects = Game_Action.prototype.hasItemAnyValidEffects;
  Game_Action.prototype.hasItemAnyValidEffects = function (target) {
    //if the item has the note on it, it doesn't need any other valid effect.
    return _Game_Action_hasItemAnyValidEffects.call(this, target) || Number.isInteger(Number(this.item().meta[noteName]));
  };

  //This one is the easiest place to put the exp code
  var _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
  Game_Action.prototype.applyItemUserEffect = function (target) {
    _Game_Action_applyItemUserEffect.call(this, target);
    var exp = Number(this.item().meta[noteName]);
    if (Number.isInteger(exp)) {
      target.gainExp(exp);
    }
  };

})();