module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated v4 uses react-native-worklets/plugin (must be last).
    plugins: ['react-native-worklets/plugin'],
  };
};
