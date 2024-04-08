const Role = require("../models/role");
// const db = require('../database');
// const UserSettings = require('../models/userSettings');

// const { catchSentryException } = require('../helpers/error');

exports.createRole = async function (req, res, next) {
  let role = new Role(req.body);
  role
    .save()
    .then((role) => {
      res.status(200).json(role);
    })
    .catch((err) => {
      // catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};

exports.getRoles = async function (req, res, next) {
  Role.find({})
    .then(async function (role) {
      res.setHeader("totalSize", await Role.find({}).count());
      res.json(role);
    })
    .catch(function (err) {
      catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};

exports.deleteRole = async function (req, res, next) {
  Role.findOneAndDelete({_id: req.params.id})
    .then(async function (role) {
      if(!role){
        return  res.status(500).json({ data: { message: "Role not exists" } });
      }
      res.setHeader("totalSize", await Role.find({}).count());
      res.json(role);
    })
    .catch(function (err) {
     
      return res.status(500).json({ data: { message: err.message } });
    });
};
