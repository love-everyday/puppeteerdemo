'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/home', controller.home.index);
  router.get('/kkndme', controller.kkndme.index);
  app.io.of('/').route('message', app.io.controller.nsp.exchange);
  // app.io.route('disconnect', app.controller.kkndme.disconnect);
};
