'use strict';

module.exports = app => {
  return async (ctx, next) => {
    ctx.service.crawler.checkCrawler();
    // ctx.socket.emit('message', 'connected!');
    await next();
  };
};
