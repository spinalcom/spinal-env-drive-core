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

function get_dependencies_tree(filepath, res = {}) {
  var _package = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  var _name = _package.name;
  var _dependencies = _package.dependencies;
  for (var key in _dependencies) {
    if (_dependencies.hasOwnProperty(key)) {
      if (reg.test(key)) {
        let child = {};
        let _path = path.resolve(node_modules_path + '/' + key + "/package.json");
        get_dependencies_tree(_path, child);
        res[key] = child;
      }
    }
  }
  return res;
}

function flatten_dependencies_tree(tree, res = []) {
  // push child
  for (var key in tree) {
    if (tree.hasOwnProperty(key)) {
      res.push(key);
      flatten_dependencies_tree(tree[key], res);
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
  console.log("-- flatten --");
  var dependencies = flatten_dependencies_tree(dependencies_tree)
  console.log(dependencies);
}

main();