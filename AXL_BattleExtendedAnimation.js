
Sprite_Actor.prototype.stepToEnemy = function () {
  this.startMove(-192, 0, 24);
};

var Sprite_Actor_prototype_updateTargetPosition = Sprite_Actor.prototype.updateTargetPosition;
Sprite_Actor.prototype.updateTargetPosition = function () {
  if (this._actor.isActing()) {
    this.stepToEnemy();
  } else {
    Sprite_Actor_prototype_updateTargetPosition();
  }
}

Game_Battler.prototype.isDone = function () {
  return this._actionState === 'done';
};

Sprite_Actor.prototype.refreshMotion = function () {
  var actor = this._actor;
  var motionGuard = Sprite_Actor.MOTIONS['guard'];
  if (actor) {
    if (this._motion === motionGuard && !BattleManager.isInputting()) {
      return;
    }
    var stateMotion = actor.stateMotionIndex();
    if (actor.isInputting()) {
      this.startMotion('walk');
    } else if (actor.isActing()) {
      //TODO: step in motion
      this.startMotion('walk');
    } else if (stateMotion === 3) {
      this.startMotion('dead');
    } else if (stateMotion === 2) {
      this.startMotion('sleep');
    } else if (actor.isChanting()) {
      this.startMotion('chant');
    } else if (actor.isGuard() || actor.isGuardWaiting()) {
      this.startMotion('guard');
    } else if (stateMotion === 1) {
      this.startMotion('abnormal');
    } else if (actor.isDying()) {
      this.startMotion('dying');
    } else if (actor.isUndecided()) {
      this.startMotion('walk');
    } else if (actor.isDone()) {
      //TODO: step out motion
      this.startMotion('escape');
    } else {
      this.startMotion('wait');
    }
  }
};