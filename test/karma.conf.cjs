module.exports = config => {
  const browsers = ['ChromeHeadless'];
  const files = ['**/*.spec.js'];
  const frameworks = ['mocha', 'chai'];
  const preprocessors = ['webpack', 'sourcemap'];
  const reporters = ['mocha'];
  const client = {
    mocha: {
      timeout: 2000
    }
  };

  return config.set({
    frameworks,
    files,
    reporters,
    basePath: '',
    port: 9876,
    colors: true,
    browsers,
    client,
    singleRun: true,
    preprocessors: {
      'unit/*.js': preprocessors
    },
    webpack: {
      devtool: 'inline-source-map',
      mode: 'development'
    }
  });
};
