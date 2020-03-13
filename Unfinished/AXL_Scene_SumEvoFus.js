//=============================================================================
// AXL_Scene_SumEvoFus.js
//=============================================================================

/*:
 * @plugindesc Displays a Scene (screen) for Evolutions and Fusions.
 * @author ElectricAxel
 *
 * @param ShowSummons
 * @text Show Summons
 * @type boolean
 * @default true
 * 
 * @param Summons
 * @parent ShowSummons
 * @type struct<Summon>[]
 * @desc List of all summons available.
 * 
 * @param ShowEvolutions
 * @text Show Evolutions
 * @type boolean
 * @default true
 * 
 * @param Evolutions
 * @parent ShowEvolutions
 * @type struct<Evolution>[]
 * @desc List of all the evolutions available.
 * 
 * @param ShowFusions
 * @text Show Fusions
 * @type boolean
 * @default true
 * 
 * @param Fusions
 * @parent ShowFusions
 * @type struct<Fusion>[]
 * @desc List of all the fusions available.
 *
 * @help
 * ===============
 * Introduction
 * ===============
 *
 * This plugin allows items to give EXP to a single Actor. The upside to using
 * a plugin is that it won't close the Menu like Common Events would.
 */

/*~struct~ItemComponent:
 * @param Item
 * @type item
 * @desc The item to consume.
 * @default 1
 * 
 * @param Cost
 * @type number
 * @desc The amount of the item to be consumed.
 * @default 1
 */

/*~struct~Summon:
 * @param Costs
 * @type struct<ItemComponent>[]
 * @desc The items to consume for this Summon to be possible.
 * 
 * @param Class
 * @type class
 * @desc Class to be produced by the Summon.
 * @default 1
 * 
 * @param Level
 * @type number
 * @desc Level the Summoned class will have.
 * @default 1
 * @min 1
 * 
 * @param UnlockRequirement
 * @text Unlock Requirement
 * @type item
 * @desc Item that needs to be in inventory for this Summon to be available.
 * @default 1
 */

/*~struct~Evolution:
 * @param Costs
 * @type struct<ItemComponent>[]
 * @desc The items to consume for this Evolution to be possible.
 * 
 * @param InitialClass
 * @text Initial Class
 * @type class
 * @desc Class to be consumed by the Evolution.
 * @default 1
 * 
 * @param LevelRequirement
 * @text Level Requirement
 * @type number
 * @desc Minimum level the class needs to be to Evolve.
 * @default 1
 * @min 1
 * 
 * @param FinalClass
 * @text Final Class
 * @type class
 * @desc Class to be produced by the Evolution.
 * @default 1
 * 
 * @param UnlockRequirement
 * @text Unlock Requirement
 * @type item
 * @desc Item that needs to be in inventory for this Evolution to be available.
 * @default 1
 */

/*~struct~ClassComponent:
 * @param Class
 * @type class
 * @desc Class to be consumed for the fusion.
 * @default 1
 * 
 * @param Level
 * @type number
 * @desc Minimum level of this class for the fusion.
 * @default 1
 * @min 1
 */

/*~struct~Product:
 * @param Class
 * @type class
 * @desc Class to be produced by the fusion.
 * @default 1
 */

/*~struct~Fusion:
 * @param Costs
 * @type struct<ItemComponent>[]
 * @desc The items to consume by the fusion.
 * 
 * @param ComponentClasses
 * @text Component Classes
 * @type struct<ClassComponent>[]
 * @desc Classes to be consumed by the fusion.
 * 
 * @param FinalClass
 * @text Final Class
 * @type struct<Product>
 * @desc Class to be produced by the fusion.
 * 
 * @param UnlockRequirement
 * @text Unlock Requirement
 * @type item
 * @desc Item that needs to be in inventory for this Fusion to be available.
 * @default 1
 */

//container for variables and methods so they don't leak into other plugins
var AXLLib = AXLLib || {};

(function () {

  //container for variables and methods related to this plugin
  AXLLib.SumEvoFus = AXLLib.SumEvoFus || {};

  //constants used for command windows and handlers
  AXLLib.SumEvoFus.Constants = {
    summon: 'summon',
    evolution: 'evolution',
    fusion: 'fusion'
  };

  //simple way to set up the commands later
  AXLLib.SumEvoFus.commands = {
    summon: ['Summon', AXLLib.SumEvoFus.Constants.summon, true],
    evolution: ['Evolution', AXLLib.SumEvoFus.Constants.evolution, true],
    fusion: ['Fusion', AXLLib.SumEvoFus.Constants.fusion, true]
  };

  /**
   * Reads the parameters and parses all the structures this plugin relies on.
   */
  AXLLib.SumEvoFus.processParameters = function processParameters() {
    var parameters = PluginManager.parameters("AXL_Scene_SumEvoFus");

    AXLLib.SumEvoFus.commands.summon[2] = parameters["ShowSummons"] == "true";

    AXLLib.SumEvoFus.summons = JSON.parse(parameters["Summons"]);
    AXLLib.SumEvoFus.summons.forEach(function (element, index, self) {
      self[index] = JSON.parse(element);
      self[index].Costs = JSON.parse(self[index].Costs);
      self[index].Costs.forEach(function (element, index, self) {
        self[index] = JSON.parse(element);
      });
    });

    AXLLib.SumEvoFus.commands.evolution[2] = parameters["ShowEvolutions"] == "true";

    AXLLib.SumEvoFus.evolutions = JSON.parse(parameters["Evolutions"]);
    AXLLib.SumEvoFus.evolutions.forEach(function (element, index, self) {
      self[index] = JSON.parse(element);
      self[index].Costs = JSON.parse(self[index].Costs);
      self[index].Costs.forEach(function (element, index, self) {
        self[index] = JSON.parse(element);
      });
    });

    AXLLib.SumEvoFus.commands.fusion[2] = parameters["ShowFusions"] == "true";

    AXLLib.SumEvoFus.fusions = JSON.parse(parameters["Fusions"]);
    AXLLib.SumEvoFus.fusions.forEach(function (element, index, self) {
      self[index] = JSON.parse(element);
      self[index].Costs = JSON.parse(self[index].Costs);
      self[index].Costs.forEach(function (element, index, self) {
        self[index] = JSON.parse(element);
      });
      self[index].ComponentClasses = JSON.parse(self[index].ComponentClasses);
      self[index].ComponentClasses.forEach(function (element, index, self) {
        self[index] = JSON.parse(element);
      });
      self[index].FinalClass = JSON.parse(self[index].FinalClass);
    });
  };

  /**
   * Gets an Array of Actors (not Game_Actors) by their Class.
   * @param {number} classId - Id of the Class to look by.
   * @returns {Object[]} - List of Actors
   */
  AXLLib.SumEvoFus.dataActors_ByClass = function dataActors_ByClass(classId) {
    return $dataActors.filter(function (actor) {
      return actor && actor.classId == classId;
    });
  };

  /**
   * Gets an Array of Actors not in the Party by their Class.
   * @param {number} classId - Id of the Class to look by.
   * @returns {Object[]} - List of Actors
   */
  AXLLib.SumEvoFus.dataActors_ByClass_NotInParty = function dataActors_ByClass_NotInParty(classId) {
    return AXLLib.SumEvoFus.dataActors_ByClass(classId).filter(function (actor) {
      return !AXLLib.SumEvoFus.gameParty_ContainsActor(actor.id);
    });
  };

  /**
   * Counts how many Actors have a specified Class.
   * @param {number} classId - Id of the Class to look by.
   * @returns {number} - Amount of Actors
   */
  AXLLib.SumEvoFus.dataActors_CountClass = function dataActors_CountClass(classId) {
    return AXLLib.SumEvoFus.dataActors_ByClass(classId).length;
  };

  /**
   * Gets an Array of Game_Actors in the Party by their Class.
   * @param {number} classId - Id of the Class to look by.
   * @returns {Game_Actor[]} - List of Game_Actors
   */
  AXLLib.SumEvoFus.gameParty_IdsByClass = function gameParty_IdsByClass(classId) {
    return $gameParty._actors.filter(function (actorId) {
      return $gameActors.actor(actorId)._classId == classId;
    });
  };

  /**
   * Counts how many Actors in the Party have a specified Class.
   * @param {number} classId - Id of the Class to look by.
   * @returns {number} - Amount of Game_Actors
   */
  AXLLib.SumEvoFus.gameParty_CountClass = function gameParty_CountClass(classId) {
    return AXLLib.SumEvoFus.gameParty_IdsByClass(classId).length;
  };

  /**
   * Checks if the GameParty contains an Actor by their Id.
   * @param {number} actorId - Id of the Actor to check for.
   * @returns {boolean} - Whether the Actor is in the Party or not.
   */
  AXLLib.SumEvoFus.gameParty_ContainsActor = function gameParty_ContainsActor(actorId) {
    return $gameParty._actors.contains(actorId);
  };

  /**
   * Gets an Array of Game_Actors in the Party by their Class and Level.
   * @param {number} classId - Id of the Class to look by.
   * @param {number} level - Minimum Level to look by.
   * @returns {Game_Actor[]} - List of Game_Actors
   */
  AXLLib.SumEvoFus.gameParty_ByClassLevel = function gameParty_ByClassLevel(classId, level) {
    return $gameParty._actors.filter(function (actorId) {
      var actor = $gameActors.actor(actorId);
      return actor._classId == classId && actor._level >= level;
    });
  };

  /**
   * Checks if a certain Class still has Actors that don't belong to the Party.
   * @param {number} classId - Id of the Class to look by.
   * @returns {boolean} - Whether the Actor can be added to the Party or not.
   */
  AXLLib.SumEvoFus.classAvailable = function classAvailable(classId) {
    return AXLLib.SumEvoFus.dataActors_CountClass(classId) - AXLLib.SumEvoFus.gameParty_CountClass(classId) > 0;
  }

  //This method was left to add new options of the Menu
  var _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
  Window_MenuCommand.prototype.addOriginalCommands = function () {
    _Window_MenuCommand_addOriginalCommands.call(this);
    this.addCommand('Summon/Evolve/Fuse', 'sumevofus');
  };

  //Adding a handler for the new option we added to the Menu, so that rpg maker knows what to do when it's selected
  var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function () {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler('sumevofus', this.commandSumEvoFus.bind(this));
  };

  //When the new option in the Menu is selected, show our new Scene.
  Scene_Menu.prototype.commandSumEvoFus = function () {
    SceneManager.push(Scene_SumEvoFus);
  };

  //-----------------------------------------------------------------------------
  //#region Scene_SumEvoFus
  //
  // The scene class of the summon/evolution/fusion screen.

  /**
   * Scene containing the windows to Summon, Evolve and Fuse mons.
   * @constructor
   * @extends Scene_MenuBase
   */
  function Scene_SumEvoFus() {
    this.initialize.apply(this, arguments);
  }

  Scene_SumEvoFus.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_SumEvoFus.prototype.constructor = Scene_SumEvoFus;

  Scene_SumEvoFus.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  /**
   * Sets up all the Windows that are going to be used by the scene.
   */
  Scene_SumEvoFus.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createHelpWindow();
    this.createDummyWindow();
    this.createSummonWindows();
    this.createEvolutionWindow();
    this.createFusionWindow();
    this.createCostsWindow();
    this.createComponentsWindow();
    this.createProductWindow();
  };

  /**
   * Creates the command window, which is the window up top with the different
   * options.
   */
  Scene_SumEvoFus.prototype.createCommandWindow = function () {
    this._commandWindow = new Window_SumEvoFusCommand();
    this._commandWindow.setHandler(AXLLib.SumEvoFus.Constants.summon, this.commandSummon.bind(this));
    this._commandWindow.setHandler(AXLLib.SumEvoFus.Constants.evolution, this.commandEvolution.bind(this));
    this._commandWindow.setHandler(AXLLib.SumEvoFus.Constants.fusion, this.commandFusion.bind(this));
    this._commandWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._commandWindow);
  };

  /**
   * Creates the help window, which shows information about the summon or
   * evolution being hovered.
   */
  Scene_MenuBase.prototype.createHelpWindow = function () {
    this._helpWindow = new Window_SumEvoFusSummonOutput();
    this._helpWindow.hide();
    this.addWindow(this._helpWindow);
  };

  /**
   * Creates the empty window visible before selecting an option from the
   * command window.
   */
  Scene_SumEvoFus.prototype.createDummyWindow = function () {
    var wy = this._commandWindow.y + this._commandWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._dummyWindow = new Window_Base(0, wy, Graphics.boxWidth, wh);
    this.addWindow(this._dummyWindow);
  };

  /**
   * Creates the window with a list of which mons can be summoned.
   */
  Scene_SumEvoFus.prototype.createSummonWindows = function () {
    var wy = this._commandWindow.y + this._commandWindow.height;
    var wh = Graphics.boxHeight - wy - this._helpWindow.height;
    this._summonWindow = new Window_SumEvoFusSummon(wy, wh, AXLLib.SumEvoFus.summons);
    this._summonWindow.setHandler('ok', this.onSummonOk.bind(this));
    this._summonWindow.setHandler('cancel', this.onWindowCancel.bind(this));
    this._summonWindow.setOutputWindow(this._helpWindow);
    this._summonWindow.hide();
    this.addWindow(this._summonWindow);
  };

  /**
   * Creates the window with a list of which mons can be evolved.
   */
  Scene_SumEvoFus.prototype.createEvolutionWindow = function () {
    var wy = this._commandWindow.y + this._commandWindow.height;
    var wh = Graphics.boxHeight - wy - this._helpWindow.height;
    this._evolutionWindow = new Window_SumEvoFusEvolution(wy, wh, AXLLib.SumEvoFus.evolutions);
    this._evolutionWindow.setHandler('ok', this.onEvolutionOk.bind(this));
    this._evolutionWindow.setHandler('cancel', this.onWindowCancel.bind(this));
    this._evolutionWindow.setOutputWindow(this._helpWindow);
    this._evolutionWindow.hide();
    this.addWindow(this._evolutionWindow);
  };

  /**
   * Creates the window with a list of which mons can be fused.
   */
  Scene_SumEvoFus.prototype.createFusionWindow = function () {
    var wy = this._commandWindow.y + this._commandWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._fusionWindow = new Window_SumEvoFusFusion(wy, wh, AXLLib.SumEvoFus.fusions);
    this._fusionWindow.setHandler('ok', this.onFusionOk.bind(this));
    this._fusionWindow.setHandler('cancel', this.onWindowCancel.bind(this));
    this._fusionWindow.hide();
    this.addWindow(this._fusionWindow);
  };

  /**
   * Creates a window with a list of the costs to fuse mons.
   */
  Scene_SumEvoFus.prototype.createCostsWindow = function () {

    this._fusionWindow.setCostWindow(this._costWindow);
  };

  /**
   * Creates a window with a list of the mons needed for a fusion.
   */
  Scene_SumEvoFus.prototype.createComponentsWindow = function () {

    this._fusionWindow.setComponentsWindow(this._componentsWindow);
  };

  /**
   * Creates a window to show the result of a fusion.
   */
  Scene_SumEvoFus.prototype.createProductWindow = function () {
    this._productWindow = new Window_SumEvoFusFusionOutput(this._fusionWindow.windowWidth());
    this._fusionWindow.setProductWindow(this._productWindow);
  };

  /**
   * When Summon is selected in the command window, hides and shows the right windows.
   */
  Scene_SumEvoFus.prototype.commandSummon = function () {
    this._dummyWindow.hide();
    this._evolutionWindow.hide();
    this._fusionWindow.hide();
    this._costWindow.hide();
    this._componentsWindow.hide();
    this._productWindow.hide();
    this._helpWindow.show();
    this._summonWindow.show();
    this._summonWindow.activate();
  };

  /**
   * When Evolution is selected in the command window, hides and shows the right windows.
   */
  Scene_SumEvoFus.prototype.commandEvolution = function () {
    this._dummyWindow.hide();
    this._summonWindow.hide();
    this._fusionWindow.hide();
    this._costWindow.hide();
    this._componentsWindow.hide();
    this._productWindow.hide();
    this._helpWindow.show();
    this._evolutionWindow.show();
    this._evolutionWindow.activate();
  };

  /**
   * When Fusion is selected in the command window, hides and shows the right windows.
   */
  Scene_SumEvoFus.prototype.commandFusion = function () {
    this._dummyWindow.hide();
    this._helpWindow.hide();
    this._summonWindow.hide();
    this._evolutionWindow.hide();
    this._fusionWindow.show();
    this._costWindow.show();
    this._componentsWindow.show();
    this._productWindow.show();
    this._fusionWindow.activate();
  };

  /**
   * General event handler for when a window is cancelled in the scene.
   */
  Scene_SumEvoFus.prototype.onWindowCancel = function () {
    this._commandWindow.activate();
    this._dummyWindow.show();
    this._helpWindow.hide();
    this._summonWindow.hide();
    this._evolutionWindow.hide();
    this._fusionWindow.hide();
    this._costWindow.hide();
    this._componentsWindow.hide();
    this._productWindow.hide();
  }

  /**
   * Event handler for when a Summon is selected in the Window_Summon
   */
  Scene_SumEvoFus.prototype.onSummonOk = function () {
    var summon = this._summonWindow.item();
    var actor = AXLLib.SumEvoFus.dataActors_ByClass_NotInParty(summon.Class)[0];
    if (actor) {
      summon.Costs.forEach(function (cost) {
        $gameParty.gainItem($dataItems[cost.Item], -cost.Cost);
      });
      $gameActors.actor(actor.id).setup(actor.id);
      $gameParty.addActor(actor.id);

      this._summonWindow.makeItemList();
      this._summonWindow.refresh();
    }

    this._summonWindow.activate();
  };

  /**
   * Event handler for when an Evolution is selected in the Window_Evolution
   */
  Scene_SumEvoFus.prototype.onEvolutionOk = function () {
    var evolution = this._evolutionWindow.item();
    var oldActorId = AXLLib.SumEvoFus.gameParty_IdsByClass(evolution.InitialClass)[0];
    var newActor = AXLLib.SumEvoFus.dataActors_ByClass_NotInParty(evolution.FinalClass)[0];
    if (oldActorId && newActor) {
      //consume the items required for the evolution.
      evolution.Costs.forEach(function (cost) {
        $gameParty.gainItem($dataItems[cost.Item], -cost.Cost);
      });

      //remove the old actor from the party.
      $gameParty.removeActor(oldActorId);

      //initialize the new actor (resets levels and such) and add it to the party
      $gameActors.actor(newActor.id).setup(newActor.id);
      $gameParty.addActor(newActor.id);

      //give the new party member the same amount of exp the old party member had.
      $gameActors.actor(newActor.id).changeExp($gameActors.actor(oldActorId)._exp[evolution.InitialClass], false);

      //heal their hp and mp
      $gameActors.actor(newActor.id).recoverAll();

      //TODO: Known bug from the old system (and this one will also have it)
      //Got to unequip everything this "mon" has and equip it to the next one.

      //refresh the available evolutions
      this._evolutionWindow.makeItemList();
      this._evolutionWindow.refresh();
    }

    this._evolutionWindow.activate();
  };

  Scene_SumEvoFus.prototype.onFusionOk = function () {

  };

  //#endregion Scene_SumEvoFus

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusCommand
  //
  // The window for selecting summon/evolution/fusion on the SumEvoFus screen.

  /**
   * Window at the top of the Scene_SumEvoFus with the different options to choose from.
   * 
   * @constructor
   * @extends Window_HorzCommand
   */
  function Window_SumEvoFusCommand() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusCommand.prototype = Object.create(Window_HorzCommand.prototype);
  Window_SumEvoFusCommand.prototype.constructor = Window_SumEvoFusCommand;

  Window_SumEvoFusCommand.prototype.initialize = function () {
    this._windowWidth = Graphics.boxWidth;
    Window_HorzCommand.prototype.initialize.call(this, 0, 0);
  };

  /**
   * How wide this window is supposed to be.
   * @returns {number}
   */
  Window_SumEvoFusCommand.prototype.windowWidth = function () {
    return this._windowWidth;
  };

  /**
   * How many columns our options are going to span.
   * @returns {number}
   */
  Window_SumEvoFusCommand.prototype.maxCols = function () {
    return 4;
  };

  /**
   * Creates the different options the user can pick from.
   */
  Window_SumEvoFusCommand.prototype.makeCommandList = function () {
    //It uses a shortcut so I can change the commands easier in the future.
    this.addCommand.apply(this, AXLLib.SumEvoFus.commands.summon);
    this.addCommand.apply(this, AXLLib.SumEvoFus.commands.evolution);
    this.addCommand.apply(this, AXLLib.SumEvoFus.commands.fusion);
    this.addCommand(TextManager.cancel, 'cancel');
  };

  //#endregion Window_SumEvoFusCommand

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusSummon
  //
  // The window for selecting a Summon.

  /**
   * This window lists all the Summons available to the Player based on the Unlock Requirement and whether they reached the limit of a certain Class.
   * It also grays out any Summon you can't pay for based on the Costs.
   * 
   * @param {number} y - Vertical position of the Window in Pixels
   * @param {number} height - Height of the Window in Pixels
   * @param {Object[]} summons - Array of Summons to be shown. The Window automatically filters by unlock requirement, costs and count.
   * @constructor
   * @extends Window_Selectable
   */
  function Window_SumEvoFusSummon() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusSummon.prototype = Object.create(Window_Selectable.prototype);
  Window_SumEvoFusSummon.prototype.constructor = Window_SumEvoFusSummon;

  Window_SumEvoFusSummon.prototype.initialize = function (y, height, summons) {
    this._windowWidth = Graphics.boxWidth;
    Window_Selectable.prototype.initialize.call(this, 0, y, this._windowWidth, height);
    this._summons = summons;
    this.makeItemList();
    this.refresh();
    this.select(0);
  };

  /**
   * How wide this window is supposed to be.
   * @returns {number}
   */
  Window_SumEvoFusSummon.prototype.windowWidth = function () {
    return this._windowWidth;
  };

  /**
   * How many columns our options are going to span.
   * @returns {number}
   */
  Window_SumEvoFusSummon.prototype.maxCols = function () {
    return 2;
  };

  /**
   * Number of Items in this Window.
   * @returns {number}
   */
  Window_SumEvoFusSummon.prototype.maxItems = function () {
    return this._metSummons ? this._metSummons.length : 1;
  };

  /**
   * Selected Item.
   * @returns {Object} - A Summon.
   */
  Window_SumEvoFusSummon.prototype.item = function () {
    return this._metSummons[this.index()];
  };

  /**
   * Indicates whether the selected item is enabled or not.
   * @returns {boolean}
   */
  Window_SumEvoFusSummon.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.item());
  };

  /**
   * Items are Grayed out based on the result of this method.
   * 
   * @param {Object} item
   * @returns {boolean}
   */
  Window_SumEvoFusSummon.prototype.isEnabled = function (item) {
    return item && item.Costs.every(function (cost) {
      return $gameParty.numItems($dataItems[cost.Item]) >= cost.Cost;
    });
  };

  /**
   * Redraws the content of the Window
   */
  Window_SumEvoFusSummon.prototype.refresh = function () {
    this.createContents();
    this.drawAllItems();
  };

  /**
   * Constructs the necessary structures and assigns the necessary properties for this window to show it's information and function properly based on the Summons provided.
   */
  Window_SumEvoFusSummon.prototype.makeItemList = function () {
    //Obtains a list of all the unique Requirements
    //Then gets a unique list of said Requirements
    //And only keeps the Requirements that are met.
    this._metRequirements = this._summons.map(function (summon) {
      return summon.UnlockRequirement;
    }).filter(function (itemId, index, self) {
      return self.indexOf(itemId) === index && $gameParty.hasItem($dataItems[itemId]);
    });

    //Makes a list of the Summons whose Requirements are met.
    this._metSummons = this._summons.filter(function (summon) {
      return this._metRequirements.contains(summon.UnlockRequirement) &&
        AXLLib.SumEvoFus.classAvailable(summon.Class);
    }, this);

    //Reserves the faces of the Classes so they can be drawn when needed.
    this._metSummons.forEach(function (summon) {
      AXLLib.SumEvoFus.dataActors_ByClass(summon.Class).forEach(function (actor) {
        ImageManager.reserveFace(actor.faceName);
      });
    });
  };

  /**
   * This method is called for every Item in this Window. In it you decide how and where to Draw each one.
   * 
   * @param {number} index
   */
  Window_SumEvoFusSummon.prototype.drawItem = function (index) {
    var summon = this._metSummons[index];
    var rect = this.itemRect(index);
    var priceWidth = 96;
    rect.width -= this.textPadding();
    this.changePaintOpacity(this.isEnabled(summon));
    this.drawText($dataClasses[summon.Class].name, rect.x, rect.y, rect.width - priceWidth);
    this.changePaintOpacity(true);
  };

  /**
   * Sets up a reference to the Window where the Summon is shown.
   * 
   * @param {Window_SumEvoFusSummonOutput} outputWindow
   */
  Window_SumEvoFusSummon.prototype.setOutputWindow = function (outputWindow) {
    this._helpWindow = outputWindow;
    this.callUpdateHelp();
  }

  /**
   * Called automatically whenever the selected Item changes. This changes the preview being shown.
   */
  Window_SumEvoFusSummon.prototype.updateHelp = function () {
    if (this._helpWindow && this.item()) {
      this._helpWindow.setItem(this.item().Class, this.item().Costs);
    } else {
      this._helpWindow.clear();
    }
  };

  //#endregion Window_SumEvoFusSummon

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusSummonOutput
  //
  // The window for displaying the description of the selected item.

  /**
   * This window shows the Image and Name of the Class being summoned, and the Cost of the Summon.
   * 
   * @constructor
   * @extends Window_Base
   */
  function Window_SumEvoFusSummonOutput() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusSummonOutput.prototype = Object.create(Window_Base.prototype);
  Window_SumEvoFusSummonOutput.prototype.constructor = Window_SumEvoFusSummonOutput;

  Window_SumEvoFusSummonOutput.prototype.initialize = function () {
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(4);
    Window_Base.prototype.initialize.call(this, 0, Graphics.boxHeight - height, width, height);
    this._classId = null;
    this._costs = null;
  };

  /**
   * Clears the Window and the Summon.
   */
  Window_SumEvoFusSummonOutput.prototype.clear = function () {
    this._classId = null;
    this._costs = null;
    this.refresh();
  };

  /**
   * Sets the Summon and redraws the information.
   * 
   * @param {number} classId
   * @param {Object[]} costs
   */
  Window_SumEvoFusSummonOutput.prototype.setItem = function (classId, costs) {
    this._classId = classId;
    this._costs = costs;
    this.refresh();
  };

  /**
   * Draws the Face of the first Actor that matchess the Class of the Summon on the left and the Costs of the Summon on the right.
   */
  Window_SumEvoFusSummonOutput.prototype.refresh = function () {
    this.contents.clear();
    if (this._classId) {
      var actors = AXLLib.SumEvoFus.dataActors_ByClass(this._classId);
      var actorClass = $dataClasses[this._classId];
      if (actors.length > 0 && actorClass) {
        var actor = $gameActors.actor(actors[0].id);
        var text_x = 12 * 2 + Window_Base._faceWidth;

        this.resetTextColor();

        //this.width === Graphics.boxWidth if it's a full row
        this.drawText(actorClass.name, text_x, 0, this.width - text_x - this.padding * 2, "left");
        this.drawActorFace(actor, 12, 0);

        var iconBoxWidth = Window_Base._iconWidth + 4;
        var x_1 = this.width - this.padding * 2 - iconBoxWidth;
        this._costs.forEach(function (cost, index) {
          var item = $dataItems[cost.Item];
          var costText = cost.Cost + " " + item.name;
          var nameWidth = this.textWidth(costText);
          var x_2 = x_1 - nameWidth;
          var y = index * this.lineHeight();

          this.drawIcon(item.iconIndex, x_2, y + 2);

          this.drawText(costText, x_2 + iconBoxWidth, y, nameWidth, "left");
        }, this);
      }
    }
  };

  //#endregion Window_SumEvoFusSummonOutput

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusEvolution
  //
  // The window for selecting a Evolution.

  /**
   * This window lists all the Evolutions available to the Player based on the Unlock Requirement and whether they reached the limit of a certain Class.
   * It also grays out any Evolution you can't pay for based on the Costs.
   * 
   * @param {number} y - Vertical position of the Window in Pixels
   * @param {number} height - Height of the Window in Pixels
   * @param {Object[]} evolutions - Array of Evolutions to be shown. The Window automatically filters by unlock requirement, costs and count.
   * @constructor
   * @extends Window_Selectable
   */
  function Window_SumEvoFusEvolution() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusEvolution.prototype = Object.create(Window_Selectable.prototype);
  Window_SumEvoFusEvolution.prototype.constructor = Window_SumEvoFusEvolution;

  Window_SumEvoFusEvolution.prototype.initialize = function (y, height, evolutions) {
    this._windowWidth = Graphics.boxWidth;
    Window_Selectable.prototype.initialize.call(this, 0, y, this._windowWidth, height);
    this._evolutions = evolutions;
    this.makeItemList();
    this.refresh();
    this.select(0);
  };

  /**
   * How wide this window is supposed to be.
   * @returns {number}
   */
  Window_SumEvoFusEvolution.prototype.windowWidth = function () {
    return this._windowWidth;
  };

  /**
   * How many columns our options are going to span.
   * @returns {number}
   */
  Window_SumEvoFusEvolution.prototype.maxCols = function () {
    return 2;
  };

  /**
   * Number of Items in this Window.
   * @returns {number}
   */
  Window_SumEvoFusEvolution.prototype.maxItems = function () {
    return this._metEvolutions ? this._metEvolutions.length : 1;
  };

  /**
   * Selected Item.
   * @returns {Object} - A Evolution.
   */
  Window_SumEvoFusEvolution.prototype.item = function () {
    return this._metEvolutions[this.index()];
  };

  /**
   * Indicates whether the selected item is enabled or not.
   * @returns {boolean}
   */
  Window_SumEvoFusEvolution.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.item());
  };

  /**
   * Items are Grayed out based on the result of this method.
   * 
   * @param {Object} item
   * @returns {boolean}
   */
  Window_SumEvoFusEvolution.prototype.isEnabled = function (item) {
    return item && item.Costs.every(function (cost) {
      return $gameParty.numItems($dataItems[cost.Item]) >= cost.Cost;
    }) && AXLLib.SumEvoFus.gameParty_ByClassLevel(item.InitialClass, item.LevelRequirement).length > 0;
  };

  /**
   * Redraws the content of the Window
   */
  Window_SumEvoFusEvolution.prototype.refresh = function () {
    this.createContents();
    this.drawAllItems();
  };

  /**
   * Constructs the necessary structures and assigns the necessary properties for this window to show it's information and function properly based on the Evolutions provided.
   */
  Window_SumEvoFusEvolution.prototype.makeItemList = function () {
    //Obtains a list of all the unique Requirements
    //Then gets a unique list of said Requirements
    //And only keeps the Requirements that are met.
    this._metRequirements = this._evolutions.map(function (evolution) {
      return evolution.UnlockRequirement;
    }).filter(function (itemId, index, self) {
      return self.indexOf(itemId) === index && $gameParty.hasItem($dataItems[itemId]);
    });

    //Makes a list of the Evolutions whose Requirements are met.
    this._metEvolutions = this._evolutions.filter(function (evolution) {
      return this._metRequirements.contains(evolution.UnlockRequirement) &&
        AXLLib.SumEvoFus.classAvailable(evolution.FinalClass);
    }, this);

    //Reserves the faces of the Classes so they can be drawn when needed.
    this._metEvolutions.forEach(function (evolution) {
      AXLLib.SumEvoFus.dataActors_ByClass(evolution.FinalClass).forEach(function (actor) {
        ImageManager.reserveFace(actor.faceName);
      });
    });
  };

  /**
   * This method is called for every Item in this Window. In it you decide how and where to Draw each one.
   * 
   * @param {number} index
   */
  Window_SumEvoFusEvolution.prototype.drawItem = function (index) {
    var evolution = this._metEvolutions[index];
    var rect = this.itemRect(index);
    var priceWidth = 96;
    rect.width -= this.textPadding();
    this.changePaintOpacity(this.isEnabled(evolution));
    this.drawText($dataClasses[evolution.FinalClass].name, rect.x, rect.y, rect.width - priceWidth);
    this.changePaintOpacity(true);
  };

  /**
   * Sets up a reference to the Window where the Evolution is shown.
   * 
   * @param {Window_SumEvoFusEvolutionOutput} outputWindow
   */
  Window_SumEvoFusEvolution.prototype.setOutputWindow = function (outputWindow) {
    this._helpWindow = outputWindow;
    this.callUpdateHelp();
  }

  /**
   * Called automatically whenever the selected Item changes. This changes the preview being shown.
   */
  Window_SumEvoFusEvolution.prototype.updateHelp = function () {
    if (this._helpWindow && this.item()) {
      this._helpWindow.setItem(this.item().FinalClass, this.item().Costs);
    } else {
      this._helpWindow.clear();
    }
  };

  //#endregion Window_SumEvoFusEvolution

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusFusion
  //
  // The window for selecting a Fusion.

  /**
   * This window lists all the Fusions available to the Player based on the Unlock Requirement and whether they reached the limit of a certain Class.
   * It also grays out any Fusion you can't pay for based on the Costs.
   * 
   * @param {number} y - Vertical position of the Window in Pixels
   * @param {number} height - Height of the Window in Pixels
   * @param {Object[]} fusions - Array of Fusions to be shown. The Window automatically filters by unlock requirement, costs and count.
   * @constructor
   * @extends Window_Selectable
   */
  function Window_SumEvoFusFusion() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusFusion.prototype = Object.create(Window_Selectable.prototype);
  Window_SumEvoFusFusion.prototype.constructor = Window_SumEvoFusFusion;

  Window_SumEvoFusFusion.prototype.initialize = function (y, height, fusions) {
    this._windowWidth = Math.floor(Graphics.boxWidth / 3); //a third of the window
    Window_Selectable.prototype.initialize.call(this, 0, y, this._windowWidth, height);
    this._fusions = fusions;
    this.makeItemList();
    this.refresh();
    this.select(0);
  };

  /**
   * How wide this window is supposed to be.
   * @returns {number}
   */
  Window_SumEvoFusFusion.prototype.windowWidth = function () {
    return this._windowWidth;
  };

  /**
   * How many columns our options are going to span.
   * @returns {number}
   */
  Window_SumEvoFusFusion.prototype.maxCols = function () {
    return 1;
  };

  /**
   * Number of Items in this Window.
   * @returns {number}
   */
  Window_SumEvoFusFusion.prototype.maxItems = function () {
    return this._metFusions ? this._metFusions.length : 1;
  };

  /**
   * Selected Item.
   * @returns {Object} - A Fusion.
   */
  Window_SumEvoFusFusion.prototype.item = function () {
    return this._metFusions[this.index()];
  };

  /**
   * Indicates whether the selected item is enabled or not.
   * @returns {boolean}
   */
  Window_SumEvoFusFusion.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.item());
  };

  /**
   * Items are Grayed out based on the result of this method.
   * 
   * @param {Object} item
   * @returns {boolean}
   */
  Window_SumEvoFusFusion.prototype.isEnabled = function (item) {
    // return item && item.Costs.every(function (cost) {
    //   return $gameParty.numItems($dataItems[cost.Item]) >= cost.Cost;
    // }) && AXLLib.SumEvoFus.gameParty_ByClassLevel(item.InitialClass, item.LevelRequirement).length > 0;
    return false;
  };

  /**
   * Redraws the content of the Window
   */
  Window_SumEvoFusFusion.prototype.refresh = function () {
    this.createContents();
    this.drawAllItems();
  };

  /**
   * Constructs the necessary structures and assigns the necessary properties for this window to show it's information and function properly based on the Fusions provided.
   */
  Window_SumEvoFusFusion.prototype.makeItemList = function () {
    //Obtains a list of all the unique Requirements
    //Then gets a unique list of said Requirements
    //And only keeps the Requirements that are met.
    this._metRequirements = [];
    this._metRequirements = this._fusions.map(function (fusion) {
      return fusion.UnlockRequirement;
    }).filter(function (itemId, index, self) {
      return self.indexOf(itemId) === index && $gameParty.hasItem($dataItems[itemId]);
    });

    // //Makes a list of the Fusions whose Requirements are met.
    this._metFusions = [];
    this._metFusions = this._fusions.filter(function (fusion) {
      return this._metRequirements.contains(fusion.UnlockRequirement) &&
        AXLLib.SumEvoFus.classAvailable(fusion.FinalClass.Class);
    }, this);

    // //Reserves the faces of the Classes so they can be drawn when needed.
    this._metFusions.forEach(function (fusion) {
      AXLLib.SumEvoFus.dataActors_ByClass(fusion.FinalClass).forEach(function (actor) {
        ImageManager.reserveFace(actor.faceName);
      });
    });
  };

  /**
   * This method is called for every Item in this Window. In it you decide how and where to Draw each one.
   * 
   * @param {number} index
   */
  Window_SumEvoFusFusion.prototype.drawItem = function (index) {
    var fusion = this._metFusions[index];
    var rect = this.itemRect(index);
    var priceWidth = 96;
    rect.width -= this.textPadding();
    this.changePaintOpacity(this.isEnabled(fusion));
    this.drawText($dataClasses[fusion.FinalClass].name, rect.x, rect.y, rect.width - priceWidth);
    this.changePaintOpacity(true);
  };

  Window_SumEvoFusFusion.prototype.setCostWindow = function (costWindow) {
    this._costWindow = costWindow;
  };

  Window_SumEvoFusFusion.prototype.setComponentsWindow = function (componentsWindow) {
    this._componentsWindow = componentsWindow;
  };

  Window_SumEvoFusFusion.prototype.setProductWindow = function (productWindow) {
    this._productWindow = productWindow;
  };

  //#endregion Window_SumEvoFusFusion

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusFusion
  //
  // The window for selecting a Fusion.

  /**
   * This window lists all the Fusions available to the Player based on the Unlock Requirement and whether they reached the limit of a certain Class.
   * It also grays out any Fusion you can't pay for based on the Costs.
   * 
   * @param {number} y - Vertical position of the Window in Pixels
   * @param {number} height - Height of the Window in Pixels
   * @param {Object[]} fusions - Array of Fusions to be shown. The Window automatically filters by unlock requirement, costs and count.
   * @constructor
   * @extends Window_Selectable
   */
  function Window_SumEvoFusFusion() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusFusion.prototype = Object.create(Window_Selectable.prototype);
  Window_SumEvoFusFusion.prototype.constructor = Window_SumEvoFusFusion;

  Window_SumEvoFusFusion.prototype.initialize = function (y, height, fusions) {
    this._windowWidth = Math.floor(Graphics.boxWidth / 3); //a third of the window
    Window_Selectable.prototype.initialize.call(this, 0, y, this._windowWidth, height);
    this._fusions = fusions;
    this.makeItemList();
    this.refresh();
    this.select(0);
  };

  /**
   * How wide this window is supposed to be.
   * @returns {number}
   */
  Window_SumEvoFusFusion.prototype.windowWidth = function () {
    return this._windowWidth;
  };

  /**
   * How many columns our options are going to span.
   * @returns {number}
   */
  Window_SumEvoFusFusion.prototype.maxCols = function () {
    return 1;
  };

  /**
   * Number of Items in this Window.
   * @returns {number}
   */
  Window_SumEvoFusFusion.prototype.maxItems = function () {
    return this._metFusions ? this._metFusions.length : 1;
  };

  /**
   * Selected Item.
   * @returns {Object} - A Fusion.
   */
  Window_SumEvoFusFusion.prototype.item = function () {
    return this._metFusions[this.index()];
  };

  /**
   * Indicates whether the selected item is enabled or not.
   * @returns {boolean}
   */
  Window_SumEvoFusFusion.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.item());
  };

  /**
   * Items are Grayed out based on the result of this method.
   * 
   * @param {Object} item
   * @returns {boolean}
   */
  Window_SumEvoFusFusion.prototype.isEnabled = function (item) {
    // return item && item.Costs.every(function (cost) {
    //   return $gameParty.numItems($dataItems[cost.Item]) >= cost.Cost;
    // }) && AXLLib.SumEvoFus.gameParty_ByClassLevel(item.InitialClass, item.LevelRequirement).length > 0;
    return false;
  };

  /**
   * Redraws the content of the Window
   */
  Window_SumEvoFusFusion.prototype.refresh = function () {
    this.createContents();
    this.drawAllItems();
  };

  /**
   * Constructs the necessary structures and assigns the necessary properties for this window to show it's information and function properly based on the Fusions provided.
   */
  Window_SumEvoFusFusion.prototype.makeItemList = function () {
    //Obtains a list of all the unique Requirements
    //Then gets a unique list of said Requirements
    //And only keeps the Requirements that are met.
    this._metRequirements = [];
    this._metRequirements = this._fusions.map(function (fusion) {
      return fusion.UnlockRequirement;
    }).filter(function (itemId, index, self) {
      return self.indexOf(itemId) === index && $gameParty.hasItem($dataItems[itemId]);
    });

    // //Makes a list of the Fusions whose Requirements are met.
    this._metFusions = [];
    this._metFusions = this._fusions.filter(function (fusion) {
      return this._metRequirements.contains(fusion.UnlockRequirement) &&
        AXLLib.SumEvoFus.classAvailable(fusion.FinalClass.Class);
    }, this);

    // //Reserves the faces of the Classes so they can be drawn when needed.
    this._metFusions.forEach(function (fusion) {
      AXLLib.SumEvoFus.dataActors_ByClass(fusion.FinalClass).forEach(function (actor) {
        ImageManager.reserveFace(actor.faceName);
      });
    });
  };

  /**
   * This method is called for every Item in this Window. In it you decide how and where to Draw each one.
   * 
   * @param {number} index
   */
  Window_SumEvoFusFusion.prototype.drawItem = function (index) {
    var fusion = this._metFusions[index];
    var rect = this.itemRect(index);
    var priceWidth = 96;
    rect.width -= this.textPadding();
    this.changePaintOpacity(this.isEnabled(fusion));
    this.drawText($dataClasses[fusion.FinalClass].name, rect.x, rect.y, rect.width - priceWidth);
    this.changePaintOpacity(true);
  };

  Window_SumEvoFusFusion.prototype.setCostWindow = function (costWindow) {
    this._costWindow = costWindow;
  };

  Window_SumEvoFusFusion.prototype.setComponentsWindow = function (componentsWindow) {
    this._componentsWindow = componentsWindow;
  };

  Window_SumEvoFusFusion.prototype.setProductWindow = function (productWindow) {
    this._productWindow = productWindow;
  };

  //#endregion Window_SumEvoFusFusion

  //-----------------------------------------------------------------------------
  //#region Window_SumEvoFusFusionOutput
  //
  // The window for displaying the description of the selected item.

  /**
   * This window shows the Image and Name of the Class gained from the Fusion.
   * 
   * @constructor
   * @extends Window_Base
   */
  function Window_SumEvoFusFusionOutput() {
    this.initialize.apply(this, arguments);
  }

  Window_SumEvoFusFusionOutput.prototype = Object.create(Window_Base.prototype);
  Window_SumEvoFusFusionOutput.prototype.constructor = Window_SumEvoFusFusionOutput;

  Window_SumEvoFusFusionOutput.prototype.initialize = function (x) {
    var width = Graphics.boxWidth - x;
    var height = this.fittingHeight(4);
    Window_Base.prototype.initialize.call(this, x, Graphics.boxHeight - height, width, height);
    this._classId = null;
  };

  /**
   * Clears the Window and the Summon.
   */
  Window_SumEvoFusFusionOutput.prototype.clear = function () {
    this._classId = null;
    this.refresh();
  };

  /**
   * Sets the Summon and redraws the information.
   * 
   * @param {number} classId
   */
  Window_SumEvoFusFusionOutput.prototype.setItem = function (classId) {
    this._classId = classId;
    this.refresh();
  };

  /**
   * Draws the Face of the first Actor that matchess the Class of the Summon on the left and the Costs of the Summon on the right.
   */
  Window_SumEvoFusFusionOutput.prototype.refresh = function () {
    this.contents.clear();
    if (this._classId) {
      var actors = AXLLib.SumEvoFus.dataActors_ByClass(this._classId);
      var actorClass = $dataClasses[this._classId];
      if (actors.length > 0 && actorClass) {
        var actor = $gameActors.actor(actors[0].id);
        var text_x = 12 * 2 + Window_Base._faceWidth;

        this.resetTextColor();

        //this.width === Graphics.boxWidth if it's a full row
        this.drawText(actorClass.name, text_x, 0, this.width - text_x - this.padding * 2, "left");
        this.drawActorFace(actor, 12, 0);
      }
    }
  };

  //#endregion Window_SumEvoFusFusionOutput

  //Make sure we load all our parameters data
  AXLLib.SumEvoFus.processParameters();
})();