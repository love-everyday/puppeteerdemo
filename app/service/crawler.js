'use strict';

const Service = require('egg').Service;
const puppeteer = require('puppeteer');
const fs = require('fs');
const { promisify } = require('util');

class CrawlerService extends Service {
  async startCrawler() {
    const brower = await puppeteer.launch();
    this.app.brower = brower;
    const page = await brower.newPage();
    const fd = await promisify(fs.open)('./download/kkndme.md', 'w');
    this.app.fd = fd;
    this.offNum = 0;
    this.checkCrawler(true);
    await this.crawlerInfo('http://bbs.tianya.cn/m/post-house-252774-1.shtml', page, fd);
    brower.close();
    fs.closeSync(fd);
  }

  async stopCrawler() {
    const { app } = this;
    app.brower && app.brower.close();
    app.fd && promisify(fs.close)(app.fd);
    app.brower = null;
    app.fd = null;
    this.checkCrawler(true);
  }

  async downloadCrawlerFile() {
    console.log('downloadCrawlerFile');
    const isExist = await promisify(fs.exists)('./download/kkndme.md');
    if (isExist) {
      this.ctx.socket.emit('download', '/download/kkndme.md');
    } else {
      this.ctx.socket.emit('message', 'Not found the file which you wanted to download!');
    }
  }

  checkCrawler(isNoticeAll = false) {
    let target = null;
    if (isNoticeAll) {
      target = this.app.io.of('/');
    } else {
      target = this.ctx.socket;
    }
    if (this.app.brower) {
      target.emit('crawler', 'isCrawler');
    } else {
      target.emit('crawler', 'crawlerOver');
    }
  }

  async crawlerInfo(url, page, fd) {
    // this.ctx.socket && this.ctx.socket.emit('message', url);
    const nsp = this.app.io.of('/');
    nsp.emit('message', url);
    let ret = null;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      ret = await page.evaluate(() => {
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
    } catch (error) {
      console.log(error);
    }

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
      let next = null;
      try {
        next = await page.evaluate(() => {
          const nextElement = document.getElementsByClassName('u-btn next-btn').item(0);
          return nextElement && nextElement.href;
        });
      } catch (error) {
        console.log(error);
      }

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
