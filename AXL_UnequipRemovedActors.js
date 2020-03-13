//=============================================================================
// AXL_UnequipRemovedActors.js
//=============================================================================

/*:
 * @plugindesc Removes all the equipped items when removed from party.
 * @author ElectricAxel
 *
 * @help Removed from party means when the actor is removed, not when they're outside of battle formation.
 */

(function () {
  var _Game_Party_removeActor = Game_Party.prototype.removeActor;
  Game_Party.prototype.removeActor = function (actorId) {
    if (this._actors.contains(actorId)) {
      $gameActors.actor(actorId).clearEquipments();
      _Game_Party_removeActor.call(this, actorId);
    }
  };
})();