const { checkSchema } = require("express-validator");
const User = require("../models/user");
const Role = require("../models/role");
const mongoose = require("mongoose");
const optional = {
  options: {
    checkFalsy: true,
  },
};

exports.getUsers = [
  checkSchema({
    pageSize: {
      optional: true,
      in: ["query"],
      isInt: {
        errorMessage:
          "invalid pageSize. valid range between 1 and " +
          Number.MAX_SAFE_INTEGER,
        options: {
          min: 1,
          max: Number.MAX_SAFE_INTEGER,
        },
      },
    },
    page: {
      optional: true,
      in: ["query"],
      isInt: true,
    },
    email: {
      optional: true,
      in: ["query"],
      isEmail: true,
      errorMessage: "invalid email",
    },
    match: {
      optional: true,
      in: ["query"],
      isAscii: true,
      errorMessage: "invalid match",
    },
  }),
];

exports.createUser = [
  checkSchema({
    name: {
      in: ["body"],
      isBoolean: {
        bail: true,
        negated: true,
      },
      isAscii: {
        bail: true,
        errorMessage: "name should be ascii",
      },
      isLength: {
        errorMessage: "name should be at least 1 chars long",
        options: [{ min: 1 }],
      },
    },
    phone: {
      optional,
      in: ["body"],
      isAscii: {
        bail: true,
        errorMessage: "phone should be ascii",
      },
      isLength: {
        errorMessage: "phone should be at least 1 chars long",
        options: [{ min: 1 }],
      },
    },
    email: {
      in: ["body"],
      isEmail: {
        bail: true,
        errorMessage: "invalid email",
      },
      custom: {
        options: async (email) => {
          if (await User.where({ email }).count()) {
            throw new Error("Email already exists");
          }
        },
      },
    },
    password: {
      in: ["body"],
      isAscii: {
        bail: true,
        errorMessage: "password should be ascii",
      },
      isLength: {
        errorMessage: "password should be at least 1 chars long",
        options: [{ min: 1 }],
      },
    },
    role: {
      in: ["body"],
      errorMessage: "invalid role",
      custom: {
        options: async (role) => {
          if (!mongoose.Types.ObjectId.isValid(role)) {
            throw new Error("Role_id not correct");
          }

          if (!(await Role.findById(role).exec())) {
            throw new Error("Role_id not exists");
          }
        },
      },
    },
  }),
];

exports.updateUser = [
  checkSchema({
    id: {
      in: ["params"],
      isMongoId: {
        bail: true,
        errorMessage: "invalid id",
      },
      custom: {
        options: async (id) => {
          if (!(await User.findById(id).exec())) {
            throw new Error("in existent id");
          }
        },
      },
    },
    email: {
      in: ["body"],
      isEmail: {
        bail: true,
        errorMessage: "invalid email",
      },
      custom: {
        options: async (email, { req }) => {
          if (
            await User.find({
              isDelete: false,
              email: email,
              _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
            }).count()
          ) {
            throw new Error("Email already exists");
          }
          return true;
        },
      },
    },
    name: {
      in: ["body"],
      isBoolean: {
        bail: true,
        negated: true,
      },
      isAscii: {
        bail: true,
        errorMessage: "name should be ascii",
      },
      isLength: {
        errorMessage: "name should be at least 1 chars long",
        options: [{ min: 1 }],
      },
    },
    password: {
      in: ["body"],
      isAscii: {
        bail: true,
        errorMessage: "password should be ascii",
      },
      isLength: {
        errorMessage: "password should be at least 1 chars long",
        options: [{ min: 1 }],
      },
    },
    phone: {
      optional,
      in: ["body"],
      isAscii: {
        bail: true,
        errorMessage: "phone should be ascii",
      },
      isLength: {
        errorMessage: "phone should be at least 1 chars long",
        options: [{ min: 1 }],
      },
    },
    role: {
      in: ["body"],
      isMongoId: {
        bail: true,
        errorMessage: "invalid role",
      },

      custom: {
        options: async (role) => {
          if (!mongoose.Types.ObjectId.isValid(role)) {
            throw new Error("Role_id not correct");
          }

          if (!(await Role.findById(role).exec())) {
            throw new Error("Role_id not exists");
          }
        },
      },
    },
  }),
];
// exports.updatePassword = [
//   checkSchema({
//     id: {
//       in: ["params"],
//       isUUID: {
//         bail: true,
//         errorMessage: "invalid id",
//       },
//       custom: {
//         options: async (id) => {
//           if (!(await User.where({ id }).count())) {
//             throw new Error("inexistent id");
//           }
//         },
//       },
//     },
//     password: {
//       in: ["body"],
//       isAscii: {
//         bail: true,
//         errorMessage: "password should be ascii",
//       },
//       isLength: {
//         errorMessage: "password should be at least 1 chars long",
//         options: [{ min: 1 }],
//       },
//     },
//   }),
// ];
