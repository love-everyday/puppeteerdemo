'use strict';

const Controller = require('egg').Controller;


class NspController extends Controller {
  async exchange() {
    const { ctx, app } = this;
    const message = ctx.args[0] || {};
    if (message === 'start') {
      ctx.service.crawler.startCrawler();
    } else if (message === 'stop') {
      ctx.service.crawler.stopCrawler();
    }
  }


}

module.exports = NspController;
