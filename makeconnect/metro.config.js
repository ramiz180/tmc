const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Some versions of bottom-sheet v5 have issues resolving internal components on Windows
// Ensuring typical extensions are handled properly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
