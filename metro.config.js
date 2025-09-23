const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  '@firebase/app': '@firebase/app',
  '@firebase/database': '@firebase/database',
};

module.exports = config;
  '@firebase/database': '@firebase/database'
};

module.exports = config;
