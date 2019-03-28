var SpinalDrive_App_list = require("./SpinalDrive_App_list");

/** Class representing the SpinalDrive Environnement */
class SpinalDrive_Env {
  /**
   * Creates an instance of SpinalDrive_Env.
   * @memberof SpinalDrive_Env
   */
  constructor() {
    this.containerLst = {};
    this.context_file_exp_app_icon = {
      Directory: "folder",
      Session: "desktop_windows",
      default: "insert_drive_file"
    };
  }
  /**
   * add_navbar_application.
   *
   * @param {string} key key string of the layer: `FolderExplorer` or 'FileExplorer' or `Inspector` or `FileExplorerCurrDir`
   * @param {SpinalDrive_App | any} app should be an SpinalDrive_App
   * @memberof SpinalDrive_Env
   */
  add_applications(key, app) {
    if (!this.containerLst[key])
      this.containerLst[key] = new SpinalDrive_App_list();
    return this.containerLst[key].push(app);
  }
  
  /**
   * get_applications
   *
   * @param {string} key key string of the layer
   * @param {object} d dbject send to is_shown defined by each layout
   * @memberof SpinalDrive_Env
   */
  get_applications(key, d) {
    if (!this.containerLst[key])
      this.containerLst[key] = new SpinalDrive_App_list();
    return this.filterAsync(this.containerLst[key]._list, app => {
      return app.is_shown(d);
    }).then(res => {
      
     return res.sort(function(a, b) {
        return a.order_priority < b.order_priority;
      });
    })
  }
  
  /**
   * Custom Promise all re
   * @param promises {Promise[]} array of promises
   * @return {Promise<Array>} returns a single Promise that resolves when all
   * of the promises passed as an iterable have resolved or when the
   * iterable contains no promises
   static async customPromiseAll(promises){
    const res = [];
    for (let i = 0; i < promises.length; i++) {
      try {
        const result = await promises[i];
        res.push(result);
      }
      catch ( e ) {
        console.warn(e);
      }
    }
    return res;
  }*/
  
  filterAsync(arr, predicate){
    const array = Array.from(arr);
    
    return Promise.all(arr.map(( elt, index) => predicate(elt, index, array)))
      .then(res => {
        return array.filter((elt, index) => {
          return res[index];
        })
      })
  }
}
module.exports = SpinalDrive_Env;
