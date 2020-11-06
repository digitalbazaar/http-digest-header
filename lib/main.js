/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// translate `index.js` to CommonJS
require = require('esm')(module);
module.exports = require('./index.js');
