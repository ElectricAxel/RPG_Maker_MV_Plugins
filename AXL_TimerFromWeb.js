//=============================================================================
// AXL_TimerFromWeb.js
//=============================================================================

/*:
 * @plugindesc Access to Timestamps and Timespans in seconds since the Command is called using Web APIs.
 * @author ElectricAxel
 *
 * @param Web API
 * @desc Web API to request the time from.
 * @default https://worldtimeapi.org/api/America/Chicago
 *
 * @param JSON Property
 * @desc Property in the response that contains the time in seconds. ex: { unixtime: 1234567 }
 * @default unixtime
 *
 * @help
 * ============
 * Introduction
 * ============
 *
 * Saves a Timestamp provided by https://worldtimeapi.org/ to calculate how much time has transpired.
 * Requires a delay to function properly. <Wait> or <Movement Route> a Wait of 120 frames (60 fps) was long enough for my tests.
 *
 * Save and SaveRead do the exact same function but have been kept to avoid having to modify all the calls.
 * 
 * ============
 * Commands
 * ============
 *
 * -TimerFromWeb Save x
 * Sets the time to start counting to 'now'.
 * This time will be attached to the Control Variable x; for example, Control Variable 1.
 * Example Plugin Command: TimerFromWeb Save 1
 *
 * -TimerFromWeb SaveRead x
 * Reads the time once more and then stores it into the Control Variable x.
 * Because Web Requests take a while to return a value, if no delay is used,
 * you won't perceive the change the first time.
 * Example Plugin Command: TimerFromWeb SaveRead 1
 *
 */

(function () {
  if (!AXLLib.version) {
    alert("The plugin 'AXL_Core' has to be included before this plugin.");
  } else if (AXLLib.version < 1.0) {
    alert(
      "The plugin 'AXL_Core' has to be version 1.0 or higher for this plugin to function."
    );
  }

  //Read the two parameters
  var parameters = PluginManager.parameters("AXL_TimerFromWeb");
  var webApi =
    String(parameters["Web API"]) ||
    "https://worldtimeapi.org/api/America/Chicago";
  var jsonProperty = String(parameters["JSON Property"]) || "unixtime";

  //Store a fake request to prevent overuse
  var _request = { readyState: 4 };

  //Replace game constructor to save our variables
  var _Game_System_Initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_Initialize.call(this);
    this._AXLVariables.TimerFromWeb = [];
  };

  /**
   * @param controlVariableIndex This parameter specifies in which Control Variable the Time Span is going to be stored in.
   * @param resetTimer Specifies whether the TimeSpan will start counting from the moment this Call was made for the next Call.
   * 
   * This function makes a web request to the specified API and reads the specified property.
   * Depending on resetTimer, it'll save the last read value in the first position of the array, and store the new value in the second position of the array.
   * JS arrays are 0-index, RMMV Control Variables are 1-based.
   */
  AXLLib.saveTime = function (controlVariableIndex, resetTimer) {
    if (_request.readyState != 4) return;

    //If reset timer is not specified, make it true.
    resetTimer = (resetTimer == null) || resetTimer;

    $gameSystem._AXLVariables = $gameSystem._AXLVariables || {};

    $gameSystem._AXLVariables.TimerFromWeb =
      $gameSystem._AXLVariables.TimerFromWeb || [];

    $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex] = $gameSystem
      ._AXLVariables.TimerFromWeb[controlVariableIndex] || [
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      ];

    SceneManager.stop();

    if (resetTimer) {
      $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][0] =
        $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][1];
    }

    _request = new XMLHttpRequest();
    _request.open("GET", webApi);
    _request.overrideMimeType("application/json");
    _request.onload = function () {
      if (_request.status < 400) {
        var time = JSON.parse(_request.responseText);

        $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][1] =
          time[jsonProperty];

        //To avoid a bug with Save.
        if ($gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][0] == Number.MAX_SAFE_INTEGER) {
          $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][0] =
            $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][1];
        }

        //Save the time difference in one of the game variables.
        AXLLib.getTimeDifference(controlVariableIndex);
      }
    };

    _request.onloadend = function () {
      SceneManager.resume();
    };

    _request.onerror = function () {
      //todo:
    };

    _request.send();
  };

  /**
   * @param controlVariableIndex This parameter specifies in which Control Variable the Time Span is going to be stored in.
   *
   * Compares the stored values and saves the Time Span in a Control Variable.
   * JS arrays are 0-index, RMMV Control Variables are 1-based.
   */
  AXLLib.getTimeDifference = function (controlVariableIndex) {
    if (_request.readyState != 4) {
      return -1;
    }

    var dif =
      $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][1] -
      $gameSystem._AXLVariables.TimerFromWeb[controlVariableIndex][0];

    dif = dif < 0 || Number.isNaN(dif) ? 0 : dif;

    $gameVariables.setValue(controlVariableIndex, dif);

    console.log(dif);

    return dif;
  };

  /**
   * To start listening for Plugin Commands, this method has to be overriden.
   * The parameters in the Plugin Commands start at index 1.
   */
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === "TimerFromWeb") {
      switch (args[0]) {
        case "Save":
          AXLLib.saveTime(Number(args[1]), true);
          break;
        case "SaveRead":
          AXLLib.saveTime(Number(args[1]), true);
          break;
        case "Read":
          AXLLib.saveTime(Number(args[1]), false);
          break;
      }
    }
  };
})();
