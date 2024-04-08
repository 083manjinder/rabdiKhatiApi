const { checkSchema } = require("express-validator");

exports.login = [
  checkSchema({
    username: {
      in: ["body"],
      isEmail: true,
      errorMessage: "invalid username",
    },
    password: {
      in: ["body"],
      isAscii: true,
      errorMessage: "invalid password",
    },
  }),
];
