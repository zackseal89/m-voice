const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add TypeScript support
config.resolver.sourceExts.push('ts', 'tsx');

// Ensure proper module resolution
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

module.exports = config;