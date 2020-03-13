//=============================================================================
// AXL_EventsDrawItem.js
//=============================================================================

/*:
 * @plugindesc Allows drawing Item Icons as event images.
 * @author ElectricAxel
 *
 * @help When creating an event, write <ItemVariable:#> on the top left Note.
 * The number is the variable in which the Item Id is saved.
 */

(function () {

  //-----------------------------------------------------------------------------
  // Sprite_Item
  //
  // The sprite for displaying an item.

  function Sprite_Item() {
    this.initialize.apply(this, arguments);
  }

  Sprite_Item.prototype = Object.create(Sprite_Character.prototype);
  Sprite_Item.prototype.constructor = Sprite_Item;

  Sprite_Item.prototype.initialize = function (event, iconIndex) {
    Sprite_Character.prototype.initialize.call(this, event);
    this._iconIndex = iconIndex;
  };

  Sprite_Item.prototype.updateBitmap = function () {
    if (this.isImageChanged()) {
      this._tilesetId = $gameMap.tilesetId();
      this._tileId = this._character.tileId();
      this._characterName = this._character.characterName();
      this._characterIndex = this._character.characterIndex();

      this.bitmap = ImageManager.loadSystem('IconSet');
    }
  };

  Sprite_Item.prototype.updateFrame = function () {
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = this._iconIndex % 16 * pw;
    var sy = Math.floor(this._iconIndex / 16) * ph;
    this.setFrame(sx, sy, pw, ph);
  };

  Spriteset_Map.prototype.createCharacters = function () {
    this._characterSprites = [];
    $gameMap.events().forEach(function (event) {

      //extract the event note to see which shop this is
      var _iconInfo = {
        note: event.event().note
      };

      DataManager.extractMetadata(_iconInfo);

      if (Number(_iconInfo.meta.ItemVariable) && $gameVariables.value(Number(_iconInfo.meta.ItemVariable)) && $dataItems[$gameVariables.value(Number(_iconInfo.meta.ItemVariable))]) {
        this._characterSprites.push(new Sprite_Item(event, $dataItems[$gameVariables.value(Number(_iconInfo.meta.ItemVariable))].iconIndex));
      } else {
        this._characterSprites.push(new Sprite_Character(event));
      }
    }, this);
    $gameMap.vehicles().forEach(function (vehicle) {
      this._characterSprites.push(new Sprite_Character(vehicle));
    }, this);
    $gamePlayer.followers().reverseEach(function (follower) {
      this._characterSprites.push(new Sprite_Character(follower));
    }, this);
    this._characterSprites.push(new Sprite_Character($gamePlayer));
    for (var i = 0; i < this._characterSprites.length; i++) {
      this._tilemap.addChild(this._characterSprites[i]);
    }
  };
})();