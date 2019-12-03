module.exports = {
  root: true,
  extends: [
    'eslint-config-digitalbazaar'
  ],
  env: {
    node: true
  },
  globals: {
    TextDecoder: true,
    TextEncoder: true,
    Uint8Array: true
  }
}
