module.exports = {
  root: true,
  extends: [
    'digitalbazaar',
    'digitalbazaar/jsdoc',
  ],
  env: {
    mocha: true,
    node: true
  },
  globals: {
    TextDecoder: true,
    TextEncoder: true,
    Uint8Array: true
  }
};
