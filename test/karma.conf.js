module.exports = config => {
  const bundler = process.env.BUNDLER || 'webpack';
  const frameworks = ['mocha', 'chai'];
  const files = ['**/*.spec.js'];
  const reporters = ['mocha'];
  const browsers = ['ChromeHeadless'];
  const client = {
    mocha: {
      timeout: 2000
    }
  };
  // main bundle preprocessors
  const preprocessors = [];
  preprocessors.push(bundler);
  preprocessors.push('sourcemap');

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
