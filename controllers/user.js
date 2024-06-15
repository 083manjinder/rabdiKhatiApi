const Role = require("../models/role");
const User = require("../models/user");

const bcrypt = require("bcrypt");

const saltRounds = 12;

exports.createUser = async function (req, res, next) {
  let user = new User(req.body);
  await bcrypt
    .hash(user.password, saltRounds)
    .then((hash) => {
      user.password = hash;
    })
    .catch((err) => {
      if (err) {
        return false;
      }
    });

  user
    .save()
    .then(async (user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      // catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};

exports.getUsers = async function (req, res, next) {
  const page = req.query.page; // Page number
  const pageSize = req.query.pageSize; // Number of documents per page

  const skip = (page - 1) * pageSize;
  const query = User.find({ isDelete: false });
  if (req.query.match) {
    query.where("name").equals(req.query.match);
  }
  if (req.query.email) {
    query.where("email").equals(req.query.email);
  }

  query
    .populate("role")
    .skip(skip)
    .limit(pageSize)
    .then(async function (users) {
      res.setHeader("totalSize", await User.find({ isDelete: false }).count());
      res.json(users);
    })
    .catch(function (err) {
      catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};

exports.getUser = async function (req, res, next) {
  await User.findById({ _id: req.params.id })
    .where("isDelete")
    .equals(false)
    .populate("role")

    .then(async function (users) {
      res.setHeader("totalSize", await User.find({ isDelete: false }).count());
      if (!users) {
        return res.json({});
      }
      res.json(users);
    })
    .catch(function (err) {
      catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};

exports.updateUser = async function (req, res, next) {
  let userUpdate = req.body;
  await bcrypt
    .hash(userUpdate.password, saltRounds)
    .then((hash) => {
      userUpdate.password = hash;
    })
    .catch((err) => {
      if (err) {
        return false;
      }
    });
  User.findOneAndUpdate(
    { _id: req.params.id }, // Filter condition
    userUpdate, // Data to update
    { new: true } // Options: Return updated document
  )
    .then(function (user) {
      res.json(user);
    })
    .catch(function (err) {
      catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};

exports.deleteUser = async function (req, res, next) {
  let userUpdate = await User.findById({
    _id: req.params.id,
  })
    .where("isDelete")
    .equals(false)
    .exec();
  if (!userUpdate) {

return res.status(500).json({ data: { message: 'User not exists' } });
  }else{
    await bcrypt
      .hash(userUpdate.password, saltRounds)
      .then((hash) => {
        userUpdate.password = hash;
        userUpdate.isDelete = true;
      })
      .catch((err) => {
        if (err) {
          return false;
        }
      });
  }
  
  User.findOneAndUpdate(
    { _id: req.params.id }, // Filter condition
    userUpdate, // Data to update
    { new: true } // Options: Return updated document
  )
    .then(function (user) {
      res.json(user);
    })
    .catch(function (err) {
      catchSentryException(err, req);
      return res.status(500).json({ data: { message: err.message } });
    });
};
