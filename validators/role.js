const { checkSchema } = require("express-validator");

const Role = require("../models/role");

// const optional = {
//   options: {
//     checkFalsy: true,
//   },
// };

exports.createRole = [
  checkSchema({
    roleName: {
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
      custom: {
        options: async (name) => {
          let nameLowerCase = name.toLowerCase();
        
          if (await Role.where({roleName: nameLowerCase }).count()) {
            throw new Error("roleName already exists");
          }
        },
      },
    },
  }),
];
