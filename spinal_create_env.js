#!/usr/bin/env node

/**
 * Copyright 2015 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

var fs = require('fs');
var path = require('path');

var pakage_path = path.resolve('./package.json');
var node_modules_path = path.resolve('..');
var browserify = require('browserify');
var b = browserify({
  debug: true
});

var browserPath = path.resolve('../../.browser_organs');
var name = JSON.parse(fs.readFileSync(pakage_path, 'utf8')).name;
var script = JSON.parse(fs.readFileSync(pakage_path, 'utf8')).main;
var reg = /spinal-env-[-_\w]*/;

function create_browser_folder() {
  create_folder_if_not_exit(browserPath);
  create_folder_if_not_exit(path.resolve(browserPath + "/lib"));
  create_folder_if_not_exit(path.resolve(browserPath + "/templates"));
}

function create_folder_if_not_exit(params) {
  if (!fs.existsSync(params)) {
    fs.mkdirSync(params);
  }
}

function get_dependencies_tree(filepath, res = []) {
  var key, i, mod;
  if (!fs.existsSync(filepath)) return res;
  var _package = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  var _dependencies = _package.dependencies;
  for (i = 0; i < res.length; i++) {
    if (res[i].name === _package.name)
      return res;
  }
  mod = {
    name: _package.name,
    dependencies: []
  };
  res.push(mod);
  for (key in _dependencies) {
    if (_dependencies.hasOwnProperty(key)) {
      let _path = path.resolve(node_modules_path + '/' + key + "/package.json");
      get_dependencies_tree(_path, res);

      for (i = 0; i < res.length; i++) {
        if (res[i].name === key) {
          mod.dependencies.push(res[i]);
          break;
        }
      }
    }
  }

  return res;
}

function flatten_dependencies_tree(tree, mod, buf = []) {
  buf.push(mod.name);
  for (var i = 0; i < tree.length; i++) {
    if (!tree[i]._visit) {
      tree[i]._visit = true;
      for (var y = 0; y < tree[i].dependencies.length; y++) {
        flatten_dependencies_tree(tree, tree[i].dependencies[y], buf);
      }
    }
  }
  return buf;
}

function copy_template(mod) {
  var pack = require(path.resolve('../' + mod + '/package.json'));
  var templatePath = path.resolve('../' + mod + '/templates');
  var exist = fs.existsSync(templatePath);
  console.log(templatePath);
  console.log(exist);
  if (exist === true) {

    templatePath = path.resolve('../' + mod + '/templates/' + pack.name);
    copyRecursiveSync(templatePath, path.resolve(browserPath + '/templates/' + pack.name));

  }

}

function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
}

function main() {
  var _root;
  create_browser_folder();
  // var templatePath = path.resolve('./templates');
  // if (fs.existsSync(templatePath)) {
  //   copyRecursiveSync(templatePath, path.resolve(browserPath + '/templates'));
  // }
  var dependencies_tree = get_dependencies_tree(pakage_path);
  for (var i = 0; i < dependencies_tree.length; i++) {
    if (dependencies_tree[i].name === name) {
      _root = dependencies_tree[i];
    }
  }
  if (_root) {
    var dependencies = flatten_dependencies_tree(dependencies_tree, _root);
    var spinal_dependencies = dependencies.filter((obj) => {
      return reg.test(obj);
    }).reverse();
    console.log(spinal_dependencies);

    // 
    for (var y = 0; y < spinal_dependencies.length; y++) {
      console.log("START COPY");
      copy_template(spinal_dependencies[y]);
      console.log("END COPY");
    }
    var scriptPath = path.resolve(script)
    console.log(scriptPath);
    b.add(scriptPath);
    b.transform("babelify", {
      presets: ["es2015"]
    });
    b.transform("windowify");
    b.transform("uglifyify");
    var output_name = path.resolve(browserPath + '/lib/' + "spinal-lib-drive-env.js");
    var output = fs.createWriteStream(output_name);
    b.bundle().pipe(output);
  }
}

main();