/**
 * interface on an app
 */
class SpinalDrive_App {
  /**
   * Creates an instance of SpinalDrive_App.
   * @param {string} [name] 
   * @param {string} [label] 
   * @param {number} [id] 
   * @param {string} [icon] 
   * @param {string} [description] 
   * @memberof SpinalDrive_App
   */
  constructor(name = "", label = "", id = 0, icon = "", description = "") {
    this.name = name;
    this.label = label;
    this.id = id;
    this.icon = icon;
    this.description = description;
    this.order_priority = 0;
  }
  /**
   * Handler to the callback on click.
   * Method to be Overridden in child
   * 
   * @param {any} params 
   * @memberof SpinalDrive_App
   */
  action(params) {}

  log(model, username, actiontype) {
    let datestr = Date.now();
    let tab = {
      date: datestr,
      name: username,
      action: actiontype
    };
    SpinalDrive_App._log(model._info, tab);
  }

  /**
   * Method called onclick will call this.action inside
   * 
   * @param {any} params 
   * @memberof SpinalDrive_App
   */
  launch_action(params) {
    if (params.file) {
      let authService = params.scope.injector.get('authService');
      let username = authService.get_user().username;
      var actiontype = params.item.name;
      this.log(FileSystem._objects[params.file._server_id], username, actiontype);
    }
    this.action(params);
  }

  /**
   * method to know if the app is needed to be shown.
   * @param {Object} d object representing selection 
   * @returns {boolean} return true if need to be shown;
   * @memberof SpinalDrive_App
   */
  is_shown(d) {
    return true;
  }
}

SpinalDrive_App._log = (_info, tab) => {
  if (_info && !_info.log) {
    let logs = new Lst();
    _info.add_attr({
      log: new Ptr(logs)
    });
    SpinalDrive_App._pushLog(logs, tab);
  } else {
    _info.log.load((logs) => {
      if (logs) {
        SpinalDrive_App._pushLog(logs, tab);
      }
    });
  }
};

SpinalDrive_App._pushLog = (logsModel, tab) => {
  logsModel.push(tab);
};

module.exports = SpinalDrive_App;