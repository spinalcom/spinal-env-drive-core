import { SpinalServiceAccessRight } from "spinal-service-access-rights-manger";
import SpinalAdminInit from "spinal-env-admin-access-rights-manager";

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
    
    this.spinalCore = null;
    this.initialize = false;
  }
  
  init(authService, ngSpinalcore){
    this.authService = authService;
    this.spinalCore = ngSpinalcore;
    this.accessRightService = new SpinalServiceAccessRight(ngSpinalcore, authService);
    
    
  }
  
  isInitialized(){
    return SpinalAdminInit;
  }
  
  /**
   * add_navbar_application.
   * @param {string} key key string of the layer: `FolderExplorer` or 'FileExplorer' or `Inspector` or `FileExplorerCurrDir`
   * @param {SpinalDrive_App | any} app should be an SpinalDrive_App
   * @memberof SpinalDrive_Env
   */
  add_applications(key, app, alias) {
    if (!alias){
      console.warn('deprecated');
    }
    return this.isInitialized().then(() => {
      this.accessRightService.checkUserAccess(alias).then(res => {
        if (res){
          if (!this.containerLst[key])
            this.containerLst[key] = new SpinalDrive_App_list();
          return this.containerLst[key].push(app);
        }
        return -1;
      });
    }) ;
    
  }
  
  /**
   * get_applications
   *
   * @param {string} key key string of the layer
   * @param {object} d object send to is_shown defined by each layout
   * @memberof SpinalDrive_Env
   */
  get_applications(key, d) {
    if (!this.containerLst[key])
      this.containerLst[key] = new SpinalDrive_App_list();
    return this.filterAsync(this.containerLst[key]._list, app => {
      return app.is_shown(d, this.spinalCore);
    }).then(res => {
      return res.sort(function(a, b) {
        return a.order_priority < b.order_priority;
      });
    })
  }
  
  
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
