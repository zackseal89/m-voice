const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are properly transformed
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Configure resolver to handle TypeScript extensions
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'ts', 'tsx'],
};

module.exports = config;