'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');

class KKndmeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./app/public/display.html');
    ctx.service.crawler.checkCrawler();
  }


}

module.exports = KKndmeController;
