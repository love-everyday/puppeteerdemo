'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1530841654820_1994';

  // add your config here
  config.middleware = [];

  config.io = {
    init: { }, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: [ 'auth' ],
        packetMiddleware: [],
      },
    },
  };

  return config;
};
