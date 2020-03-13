//=============================================================================
// AXL_BattleAnimationFrames.js
//=============================================================================

/*:
 * @plugindesc Enables [SV] Battler to have more than 3 frames per motion.
 * @author ElectricAxel
 *
 * @help
 * ===============
 * Introduction
 * ===============
 *
 * Since it's inspired by Galv's script, it also uses the same notation for the sv files, as in, if you want an sv files with 5 frames instead of the default 3, you'd call it 
 * 
 * Actor1_1%(5).png
 *
 * That is filename%(x).png where x is the number for frames.
 *
 * 
 * Unlike Galv's script, this one allows you to use a FLAG on the filename to decide whether you want to keep the "looping" of frames or not. A % at the end of the filename specifies you do NOT want looping:
 * 
 * Actor1_1%(5)%.png
 * 
 * That is filename%(x)%.png where x is the number for frames and % means it won't loop.
 * 
 *
 * ===============
 * Version History
 * ===============
 *
 * -Version 1.0:
 * Finished and tested.
 * 
 * ===============
 * Credits
 * ===============
 * 
 * This is based off of GALV_CharacterFrames, by Galv - galvs-scripts.com
 */

var AXLLib = AXLLib || {};

(function () {

  AXLLib.BatAniFra = AXLLib.BatAniFra || {};

  var _Sprite_Actor_initMembers = Sprite_Actor.prototype.initMembers;
  Sprite_Actor.prototype.initMembers = function () {
    _Sprite_Actor_initMembers.call(this);
    this._cframes = 3; //default amount of frames the motions have
    this._cloop = true; //by default, motions that should loop will loop.
  }

  var _Sprite_Actor_updateBitmap = Sprite_Actor.prototype.updateBitmap;
  Sprite_Actor.prototype.updateBitmap = function () {
    //only load the amount of frames when the bitmap actually changes
    //it goes before the original call so that we can check for bitmap changes.
    if (this._battlerName !== this._actor.battlerName()) {
      //By Galv
      var setFrame = this._actor.battlerName().match(/\%\((\d+)\)(\%)?/i);

      //if the file follows the convention, replace the amount of frames with the number in parenthesis, else use the default 3
      if (setFrame) {
        this._cframes = Number(setFrame[1]);
        this._cloop = !setFrame[2];
      } else {
        this._cframes = 3;
        this._cloop = true;
      }
    }

    _Sprite_Actor_updateBitmap.call(this); //sadly it'll get called twice
  };

  //var _Sprite_Actor_updateFrame = Sprite_Actor.prototype.updateFrame;
  Sprite_Actor.prototype.updateFrame = function () {
    Sprite_Battler.prototype.updateFrame.call(this);
    var bitmap = this._mainSprite.bitmap;
    if (bitmap) {
      var motionIndex = this._motion ? this._motion.index : 0;
      var pattern = this._pattern < this._cframes ? this._pattern : (this._cframes * 2 - 2 - this._pattern);
      var cw = bitmap.width / (3 * this._cframes);
      var ch = bitmap.height / 6;
      var cx = Math.floor(motionIndex / 6) * this._cframes + pattern;
      var cy = motionIndex % 6;
      this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch);
    }
  };

  //var _Sprite_Actor_updateMotionCount = Sprite_Actor.prototype.updateMotionCount;
  Sprite_Actor.prototype.updateMotionCount = function () {
    if (this._motion && ++this._motionCount >= this.motionSpeed()) {
      if (this._motion.loop) {
        if (this._cloop) {
          this._pattern = (this._pattern + 1) % (this._cframes * 2 - 2);
        } else {
          this._pattern = (this._pattern + 1) % this._cframes;
        }
      } else if (this._pattern < this._cframes - 1) {
        this._pattern++;
      } else {
        this.refreshMotion();
      }
      this._motionCount = 0;
    }
  };
})();


//Consider motion speed if it takes too long to cycle through

// Sprite_Actor.prototype.motionSpeed = function() {
//   return 12;
// };