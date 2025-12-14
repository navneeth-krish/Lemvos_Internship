module.exports = (config) => {
  // Fix for @oicl/openbridge-webcomponents missing .js extensions
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Also set it globally
  if (!config.resolve) {
    config.resolve = {};
  }

  config.resolve.fullySpecified = false;

  return config;
};
