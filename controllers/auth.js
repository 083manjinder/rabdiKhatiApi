const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// const BearerStrategy = require('passport-http-bearer').Strategy;

const User = require("../models/user");
const Auth = require("../models/auth");

const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const ExtractJWT = require("passport-jwt").ExtractJwt;
const JWTStrategy = require("passport-jwt").Strategy;

exports.webLogin = function (req, res, next) {
  passport.authenticate("current-back-basic", (error, loginUser, info) => {
    let user = loginUser;

    if (error) {
      return res.status(500).send({ message: error.message });
    }

    if (!user) {
      return res.status(401).send(info);
    }

    const cookieOptions = getCookieOptions();
    res.cookie("jwt", user.token, cookieOptions);

    delete user.password;

    return res.json(user);
  })(req, res, next);
};

passport.use(
  "current-back-basic",
  new LocalStrategy({ passReqToCallback: true }, async function (
    req,
    username,
    password_digest,
    done
  ) {
    try {
      let user = await User.findOne({
        email: username.trim(),
        isDelete: false,
      }).populate("role");

      if (!user) {
        return done(null, false, { message: "Invalid email " });
      }
      const { _id: userId, password } = user;
      if (!(await bcrypt.compare(password_digest, password))) {
        return done(null, false, { message: "Invalid password." });
      }
      let payload = { userId: user._id, email: user.email };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "5min" });
      // console.log("🚀 ~ token:", token);
      

      let authUser = user.toJSON();
      authUser.token = token;
      //   authUser.refresh_token = refresh_token;

      return done(null, authUser, { message: "Login successful." });
    } catch (e) {
      return done(e);
    }
  })
);

exports.isBackAuthenticated = (req, res, next) => {
  passport.authenticate(
    "jwt",
    {
      session: false,
    },
    async (error, token, info) => {
      if (error || !token) {
        res.clearCookie("jwt");
        console.log("error", error);
        res.status(401).json({ msg: info.message });
      } else {
        next();
      }
    }
  )(req, res, next);
};

const getCookieOptions = () => {
  return { httpOnly: true };
};

passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken("jwt"),
      secretOrKey: "your_jwt_secret",
    },
    (token, done) => validateJwtToken(token, done)
  )
);
const validateJwtToken = async (token, done) => {
  try {
    let user = await User.findOne({
      _id: token.userId,
      isDelete: false,
    }).populate("role");

    if (!user) {
      return done(null, false, { message: "user invaild" });
    }

    done(null, user);
  } catch (e) {
    console.log("🚀 ~ validateJwtToken ~ e:", e);
    // done(e.message);
  }
};

// const removeExpiredTokens = async () => {
//   let hasExpiredTokens = await Auth.find({
//     expiryDate: {
//       $lt: moment().subtract(TOKEN_EXPIRATION_TIME, "hours").toDate(),
//     },
//     isActive: false,
//   });

//   if (hasExpiredTokens.length > 0) {
//     await Auth.find({
//       expiryDate: {
//         $lt: moment().subtract(TOKEN_EXPIRATION_TIME, "hours").toDate(),
//       },
//       isActive: false,
//     }).deleteMany();
//   }
// };

exports.logout = async (req, res, next) => {
  let token = await Auth.find({
    userId: { $eq: new mongoose.Types.ObjectId(req.body.userId) },
  }).deleteMany();

  //   if (token) {
  //     token.deleteMany();
  //   }
  return res.json(true);
};
