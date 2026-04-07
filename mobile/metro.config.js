const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const packagesRoot = path.resolve(projectRoot, "../packages");

const config = getDefaultConfig(projectRoot);
const folders = new Set(config.watchFolders ?? []);
folders.add(packagesRoot);
config.watchFolders = [...folders];

module.exports = config;
