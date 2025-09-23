const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web platform support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
config.resolver.alias = {
  '@firebase/app': '@firebase/app',
  '@firebase/database': '@firebase/database'
};

module.exports = config;
