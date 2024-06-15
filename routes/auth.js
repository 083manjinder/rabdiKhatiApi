const WebRouter = require("express").Router();
const Validator = require('../validators/auth');
const Controller = require("../controllers/auth");
const { validate } = require('../validators/middlewareValidator');


WebRouter.post("/login", Validator.login, validate, Controller.webLogin);
WebRouter.get("/logout", Controller.isBackAuthenticated, Controller.logout)

module.exports = {
  WebRouter
};
