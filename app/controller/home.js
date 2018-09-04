'use strict';

const Controller = require('egg').Controller;
const Crawler = require('crawler');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    // ctx.body = 'wait';
    const crawler = new Crawler({
      maxConnections: 10,
      callback: (error, result, done) => {
        if (error) {
          console.log(error);
        } else {
          const $ = result.$;
          console.log(ctx.response.body);
          console.log($('title').text());
          ctx.response.body = $('title').text();
        }
        done();
      },
    });
    crawler.queue('https://juejin.im/pins');
  }
}

module.exports = HomeController;
