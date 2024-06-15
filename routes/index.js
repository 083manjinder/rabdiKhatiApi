const express = require("express");
const user = require("./user");
const role = require("./role");
const auth = require("./auth");
const farm = require("./farm");
const authValidate = require("../controllers/auth");

module.exports = function (app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
    publicRoutes = express.Router();

  // apiRoutes.use('/public', publicRoutes);

  apiRoutes.use("/auth", auth.WebRouter);
  apiRoutes.use("/users", authValidate.isBackAuthenticated, user.WebRouter);
  apiRoutes.use("/role",authValidate.isBackAuthenticated, role.WebRouter);
  apiRoutes.use("/farm",authValidate.isBackAuthenticated, farm.WebRouter);


  app.use("/api", apiRoutes);
  apiRoutes.get("/", function (req, res, next) {
    res.json({
      api: "RabdiKhati",
    });
  });
};
