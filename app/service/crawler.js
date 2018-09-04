'use strict';

const Service = require('egg').Service;
const puppeteer = require('puppeteer');
const fs = require('fs');

class CrawlerService extends Service {
  async startCrawler() {
    const brower = await puppeteer.launch();
    this.app.brower = brower;
    const page = await brower.newPage();
    const fd = fs.openSync('./download/kkndme.md', 'w');
    this.app.fd = fd;
    this.offNum = 0;
    this.checkCrawler();
    await this.crawlerInfo('http://bbs.tianya.cn/m/post-house-252774-1.shtml', page, fd);
    page.close();
    brower.close();
    fs.closeSync(fd);
  }

  async stopCrawler() {
    const { app } = this;
    app.brower && app.brower.close();
    app.fd && fs.closeSync(app.fd);
    app.brower = null;
    app.fd = null;
    this.checkCrawler();
  }

  checkCrawler() {
    if (this.app.brower) {
      this.ctx.socket.emit('crawler', 'isCrawler');
    } else {
      this.ctx.socket.emit('crawler', 'crawlerOver');
    }
  }

  async crawlerInfo(url, page, fd) {
    this.ctx.socket && this.ctx.socket.emit('message', url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const ret = await page.evaluate(() => {
      const checkParentElement = (value, loop) => {
        let element = value;
        for (let index = 0; index < loop; index++) {
          element = element.parentElement;
          if (!element) {
            return null;
          }
        }
        return element;
      };
      const user = [ ...document.getElementsByClassName('author') ];
      return user
        .filter(value => value.innerHTML.indexOf('kkndme') > -1)
        .map(value => {
          const topElement = checkParentElement(value, 3);
          if (!topElement) {
            return '';
          }
          const bdElement = topElement.getElementsByClassName('bd').item(0);
          if (!bdElement) {
            return '';
          }
          const delayElement = bdElement.getElementsByClassName('reply-div');
          const timeElement = value.parentElement.getElementsByClassName('time fc-gray').item(0);
          const time = timeElement ? timeElement.innerHTML : '';
          const content = delayElement.item(0) ? delayElement.item(0).innerHTML : bdElement.innerHTML;
          return `<h4>${time}</h4>${content}`;
        });
    });
    if (Object.prototype.toString.call(ret) === '[object Array]') {
      let content = ret.join('');
      content = content.replace(new RegExp('\\t', 'gm'), '');
      content = content.replace(new RegExp('\\n', 'gm'), '');
      content = content.replace(new RegExp(' {4}', 'gm'), '');
      if (!this.app.fd) {
        return;
      }
      const num = fs.writeSync(fd, content, this.offNum);
      this.offNum += num;
      const next = await page.evaluate(() => {
        const nextElement = document.getElementsByClassName('u-btn next-btn').item(0);
        return nextElement && nextElement.href;
      });

      if (next) {
        return await this.crawlerInfo(next, page, fd);
      }
      return;
    }
  }

  timeout(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(1);
        } catch (e) {
          reject(0);
        }
      }, delay);
    });
  }
}
module.exports = CrawlerService;
