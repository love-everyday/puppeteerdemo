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

  async download() {
    const filename = this.ctx.params.file;
    console.log(filename);

    if (!filename) {
      return;
    }
    this.ctx.attachment(filename);
    this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.body = fs.createReadStream(`./download/${filename}`);
  }

}

module.exports = KKndmeController;
