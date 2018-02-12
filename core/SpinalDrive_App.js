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


    log(params){
	let authService = params.scope.injector.get('authService');
	let username = authService.get_user().username;
	var node = FileSystem._objects[params.file._server_id];
  var actiontype = params.item.name;
  let datestr = new Date;
	var tab = {date: datestr.toLocaleString(),
		   name: username,
		   action: actiontype};
	if (!node._info.log)
	{
	    node._info.add_attr({
		log: []
	    })
	}
	node._info.log.push(tab);
    }
    
  /**
   * Method called onclick will call this.action inside
   * 
   * @param {any} params 
   * @memberof SpinalDrive_App
   */
  launch_action(params) {
    if (params.file)
      this.log(params);

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
SpinalDrive_App.SetLog = false;
module.exports = SpinalDrive_App;
