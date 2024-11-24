const path = require('path');

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'), // Alias '@' to 'src' directory
  };

  return config;
};
