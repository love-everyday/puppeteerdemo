'use strict';

const Controller = require('egg').Controller;

class NspController extends Controller {
  async exchange() {
    const { ctx } = this;
    const message = ctx.args[0] || {};
    if (message === 'start') {
      this.service.crawler.startCrawler();
    } else if (message === 'stop') {
      this.service.crawler.stopCrawler();
    } else if (message === 'download') {
      ctx.service.crawler.downloadCrawlerFile();
    }
  }


}

module.exports = NspController;
