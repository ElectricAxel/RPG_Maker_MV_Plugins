//=============================================================================
// AXL_ShopStock.js
//=============================================================================

/*:
 * @plugindesc Enables limited stock for the shops.
 * @author ElectricAxel
 *
 * @param Shop Note Name
 * @desc Name of the Note used for the shop, ie, <shopName:Map_1_Armor> would be shopName.
 * @default shopName
 *
 * @param Stock Note Name
 * @desc Name of the Note used for the item stock, ie, <stock:50> would be stock.
 * @default stock
 *
 * @param Selling Restocks
 * @desc If on, selling items will add them back to the stock. Off by default.
 * @type boolean
 * @default off
 *
 * @help
 * ===============
 * Introduction
 * ===============
 *
 * This plugin will enable stores to have individual stocks. That means that every store has a separate stock for
 * every item that has the stock note. It also handles 4 plugin commands: 1 to restock every item in a specific store,
 * and one to fully restore an individual item, weapon or armor.
 *
 * ===============
 * Instructions
 * ===============
 *
 * When setting up an Event with the Shop Processing in it, include
 * <shopName:example> in the Note for the Event. This note is at the top left
 * corner of the event window. If two shops have the same name, they will share
 * the stock. Use easy to remember names because they're necessary for the
 * restock plugin commands.
 *
 * In the Database, Items, Weapons and Armors can include <stock:10> in their
 * Note to have their initial and max stock set to 10, for example. If the
 * stock is not included in their Note, the item will have unlimited Stock.
 * Even if the Stock is unlimited, by default RPG Maker MV has a limit of 99.
 *
 * ============
 * Commands
 * ============
 *
 * -AXEL_ShopStock restockall shopName
 * This will restock every item with a stock Note on it in the specified shop.
 * shopName must match the name in the event Note.
 * Example Plugin Command: AXEL_ShopStock restockall NoobShop
 *
 * -AXEL_ShopStock restockitem shopName ID
 * This will restock a specific Item with a stock Note on it in the specified
 * shop. shopName must match the name in the event Note. The ID can be seen in
 * the Database, the number beside the name on the list to the left.
 * Example Plugin Command: AXEL_ShopStock restockitem NoobShop 1
 *
 * -AXEL_ShopStock restockweapon shopName ID
 * This will restock a specific Weapon with a stock Note on it in the specified
 * shop. shopName must match the name in the event Note. The ID can be seen in
 * the Database, the number beside the name on the list to the left.
 * Example Plugin Command: AXEL_ShopStock restockweapon NoobShop 1
 *
 * -AXEL_ShopStock restockarmor shopName ID
 * This will restock a specific Armor with a stock Note on it in the specified
 * shop. shopName must match the name in the event Note. The ID can be seen in
 * the Database, the number beside the name on the list to the left.
 * Example Plugin Command: AXEL_ShopStock restockarmor NoobShop 1
 *
 */
(function AXL_ShopStock() {
  //===========================================================================
  // LOAD PARAMETERS
  //===========================================================================
  var parameters = PluginManager.parameters("AXL_ShopStock");
  var shopNoteName = parameters["Shop Note Name"] || "shopName";
  var stockNoteName = parameters["Stock Note Name"] || "stock";
  var sellingRestocks = parameters["Selling Restocks"].toLowerCase() === "on";

  //===========================================================================
  // HELPER FUNCTIONS
  //===========================================================================
  var lookupStockByName = function (shopName) {
    $gameSystem._shopStock = $gameSystem._shopStock || {};

    return $gameSystem._shopStock[shopName];
  };

  var lookupStockByType = function (shopName, productType) {
    var stock = lookupStockByName(shopName);
    return stock && stock[productType];
  };

  var lookupStockById = function (shopName, productType, productId) {
    var stock = lookupStockByType(shopName, productType);
    return stock && stock[productId];
  };

  var restockShop = function (shopName) {
    var stock = lookupStockByName(shopName);
    if (stock) {
      stock[0].forEach(function (amount, productId) {
        restockStock(shopName, 0, $dataItems[productId]);
      });
      stock[1].forEach(function (amount, productId) {
        restockStock(shopName, 1, $dataWeapons[productId]);
      });
      stock[2].forEach(function (amount, productId) {
        restockStock(shopName, 2, $dataArmors[productId]);
      });
      return true;
    }
    return false;
  };

  var restockStock = function (shopName, productType, item) {
    var stock = lookupStockByType(shopName, productType);
    if (stock) {
      var amount = Number(item.meta[stockNoteName]);
      if (amount) {
        stock[item.id] = amount;
        return true;
      }
    }
    return false;
  };

  var decreaseStockById = function (shopName, productType, productId, number) {
    var stock = lookupStockByType(shopName, productType);
    if (stock && Number.isInteger(stock[productId])) {
      stock[productId] -= number;
      return true;
    }
    return false;
  };

  var increaseStockById = function (shopName, productType, productId, number) {
    var stock = lookupStockByType(shopName, productType);
    if (stock && Number.isInteger(stock[productId])) {
      stock[productId] += number;
      return true;
    }
    return false;
  };

  var lookupProductTypeByItem = function (item) {
    var productType = -1;
    if (item) {
      productType = DataManager.isItem(item) ? 0 : productType;
      productType = DataManager.isWeapon(item) ? 1 : productType;
      productType = DataManager.isArmor(item) ? 2 : productType;
    }
    return productType;
  };

  //===========================================================================
  // HANDLE PLUGIN COMMANDS
  //===========================================================================
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    //AXEL_ShopStock restockarmor NoobShop 1
    //command = AXEL_ShopStock
    //args[0] = restockarmor
    //args[1] = NoobShop
    //args[2] = 1

    if (command === "AXL_ShopStock") {
      var shopName = args[1];
      var productType = null;
      var productId = args[2];
      var product = null;
      switch (String(args[0]).toLowerCase()) {
        case "restockitem":
          if (!Number.isInteger(productType)) {
            productType = 0; //0 = item
            product = $dataItems[productId];
          }
        case "restockweapon":
          if (!Number.isInteger(productType)) {
            productType = 1; //1 = weapon
            product = $dataWeapons[productId];
          }
        case "restockarmor":
          if (!Number.isInteger(productType)) {
            productType = 2; //2 = armor
            product = $dataArmors[productId];
          }
          //Restock a specific item in a specific shop

          restockStock(shopName, productType, product);
          break;

        case "restockall":
          //Restock every item in a specific shop

          restockShop(shopName);
          break;
      }
    }
  };

  //===========================================================================
  // SCENE_SHOP CHANGES
  //===========================================================================
  var _Scene_Shop_prepare = Scene_Shop.prototype.prepare;
  //extend
  Scene_Shop.prototype.prepare = function (goods, purchaseOnly) {
    //explain how to not lose the old game functionality
    //

    _Scene_Shop_prepare.call(this, goods, purchaseOnly);

    $gameSystem._shopStock = $gameSystem._shopStock || {};

    //extract the event note to see which shop this is
    var _shopInfo = {
      note: $gameMap.events()[$gameMap._interpreter.eventId() - 1].event().note
    };
    DataManager.extractMetadata(_shopInfo);

    if (_shopInfo.meta[shopNoteName]) {
      this._shopName = _shopInfo.meta[shopNoteName];

      //Setup the shop
      if (!$gameSystem._shopStock[this._shopName]) {
        $gameSystem._shopStock[this._shopName] = [[], [], []];
        goods.forEach(function (good) {
          switch (good[0]) {
            case 0:
              restockStock(this._shopName, 0, $dataItems[good[1]]);
              break;
            case 1:
              restockStock(this._shopName, 1, $dataWeapons[good[1]]);
              break;
            case 2:
              restockStock(this._shopName, 2, $dataArmors[good[1]]);
              break;
          }
        }, this);
      }
      //else is not needed, because the shop is already setup
    }
  };

  var _Scene_Shop_createBuyWindow = Scene_Shop.prototype.createBuyWindow;
  //extends
  Scene_Shop.prototype.createBuyWindow = function () {
    _Scene_Shop_createBuyWindow.call(this);
    this._buyWindow.setShopName(this._shopName);
  };

  var _Scene_Shop_createStatusWindow = Scene_Shop.prototype.createStatusWindow;
  //extend
  Scene_Shop.prototype.createStatusWindow = function () {
    _Scene_Shop_createStatusWindow.call(this);
    this._statusWindow._shopName = this._shopName;
  };

  var _Scene_Shop_maxBuy = Scene_Shop.prototype.maxBuy;
  //extend
  Scene_Shop.prototype.maxBuy = function () {
    var max = _Scene_Shop_maxBuy.call(this);
    var stock = null;
    var productType = lookupProductTypeByItem(this._item);
    stock = lookupStockById(this._shopName, productType, this._item.id);
    stock = Number.isInteger(stock) ? stock : max;
    return Math.min(max, stock);
  };

  var _Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
  //extend
  Scene_Shop.prototype.doBuy = function (number) {
    _Scene_Shop_doBuy.call(this, number);

    var productType = lookupProductTypeByItem(this._item);

    decreaseStockById(this._shopName, productType, this._item.id, number);
  };

  if (sellingRestocks) {
    var _Scene_Shop_doSell = Scene_Shop.prototype.doSell;
    //extend
    Scene_Shop.prototype.doSell = function (number) {
      _Scene_Shop_doSell.call(this, number);

      var productType = lookupProductTypeByItem(this._item);

      increaseStockById(this._shopName, productType, this._item.id, number);
    };
  }

  //===========================================================================
  // WINDOW_SHOPBUY CHANGES
  //===========================================================================
  Window_ShopBuy.prototype.setShopName = function (shopName) {
    if (shopName) {
      this._shopName = shopName;
      this.shopStock = lookupStockByName(this._shopName);
    } else {
      this._shopName = null;
      this.shopStock = [[], [], []];
    }
    this.select(0);
  };

  var _Window_ShopBuy_isEnabled = Window_ShopBuy.prototype.isEnabled;
  //extend
  Window_ShopBuy.prototype.isEnabled = function (item) {
    var enabled = _Window_ShopBuy_isEnabled.call(this, item);

    var stock = lookupStockById(
      this._shopName,
      lookupProductTypeByItem(item),
      item.id
    );

    if (Number.isInteger(stock)) {
      enabled = enabled && stock > 0;
    }

    return enabled;
  };

  //===========================================================================
  // WINDOW_SHOPSTATUS CHANGES
  //===========================================================================
  var _Window_ShopStatus_drawPossession =
    Window_ShopStatus.prototype.drawPossession;
  //extend
  Window_ShopStatus.prototype.drawPossession = function (x, y) {
    if (!this._shopName) {
      _Window_ShopStatus_drawPossession.call(this, x, y);
    } else {
      _Window_ShopStatus_drawPossession.call(
        this,
        x,
        y /*+ this.lineHeight()*/
      );

      var width = this.contents.width - this.textPadding() - x;
      var stockWidth = this.textWidth("0000");
      var productType = lookupProductTypeByItem(this._item);
      var stock = null;
      if (this._item) {
        stock = lookupStockById(this._shopName, productType, this._item.id);
      }
      //alt + 236 = ∞
      stock = Number.isInteger(stock) ? stock : "∞";
      var newY = this._height - this.padding * 2 - this.lineHeight();
      this.changeTextColor(this.systemColor());
      this.drawText("Stock left", x, newY, width - stockWidth);
      this.resetTextColor();
      this.drawText(stock, x, newY, width, "right");
    }
  };
})();
