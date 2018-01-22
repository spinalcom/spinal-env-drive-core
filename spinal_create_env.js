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

function does_exist_in_tree(tree, name) {
  console.log(name);
  console.log(tree);
  if (typeof tree[name] === "undefined") {
    for (var key in tree) {
      if (tree.hasOwnProperty(key)) {
        if (does_exist_in_tree(tree[key], name) === true)
          return true;
      }
    }
    return false;
  }
  return true;

}

function get_dependencies_tree(filepath, res = []) {
  var _package = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  var _dependencies = _package.dependencies;
  for (var i = 0; i < res.length; i++) {
    if (res[i].name === _package.name)
      return res;
  }
  res.push({
    name: _package.name,
    dependencies: _dependencies
  });
  for (var key in _dependencies) {
    if (_dependencies.hasOwnProperty(key)) {
      let _path = path.resolve(node_modules_path + '/' + key + "/package.json");
      get_dependencies_tree(_path, res);
    }
  }

  return res;


  // var _package = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  // var _name = _package.name;
  // var _dependencies = _package.dependencies;
  // for (var key in _dependencies) {
  //   if (_dependencies.hasOwnProperty(key)) {
  //     // if (reg.test(key)) {
  //     if (does_exist_in_tree(_root, key) === false) {
  //       let child = {};
  //       res[key] = child;
  //       let _path = path.resolve(node_modules_path + '/' + key + "/package.json");
  //       get_dependencies_tree(_path, child, _root);
  //     }
  //     // }
  //   }
  // }
  // return res;
}

function flatten_dependencies_tree(tree, res = []) {
  // push child
  for (var key in tree) {
    if (tree.hasOwnProperty(key)) {
      res = flatten_dependencies_tree(tree[key], res);
      if (reg.test(key)) {
        res.push(key);
      }
    }
  }
  // remove duplicate
  return res.filter((v, i, a) => {
    return a.indexOf(v) === i;
  });
}

function main() {
  create_browser_folder();
  var templatePath = path.resolve('./templates');
  if (fs.existsSync(templatePath)) {
    copyRecursiveSync(templatePath, path.resolve(browserPath + '/templates'));
  }
  var dependencies_tree = get_dependencies_tree(pakage_path);
  console.log(dependencies_tree);
  // var dependencies = flatten_dependencies_tree(dependencies_tree);
  // console.log(dependencies);
  // const opts = {
  //   basedir: process.cwd(),
  //   lookups: ['dependencies']
  // };
  // console.log(opts);
  // resolve.packages(["."], opts, function (err, tree) {
  //   if (err) return console.error(err)

  //   const json = JSON.stringify(tree, null, 2)
  //   console.log(json)
  // });



}

main();