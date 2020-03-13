//=============================================================================
// AXL_ZeroMPKills.js
//=============================================================================

/*:
 * @plugindesc Makes it so your Actors faint / die when their mp runs out, just like their hp does.
 * @author ElectricAxel
 *
 * @help Default revive will also turn mp to 1 if it's at 0, just like it does with hp.
 */

(function () {
  var _Game_Battler_refresh = Game_Battler.prototype.refresh;
  Game_Battler.prototype.refresh = function () {
    Game_BattlerBase.prototype.refresh.call(this);
    if (this.hp === 0 || (this.isActor() && this.mp === 0)) {
      this.addState(this.deathStateId());
    } else {
      this.removeState(this.deathStateId());
    }
  };

  var _Game_BattlerBase_revive = Game_BattlerBase.prototype.revive;
  Game_BattlerBase.prototype.revive = function () {
    _Game_BattlerBase_revive.call(this);
    if (this._mp === 0) {
      this._mp = 1;
    }
  };
})();
