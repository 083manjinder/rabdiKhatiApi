const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// const BearerStrategy = require('passport-http-bearer').Strategy;
const CookieStrategy = require("passport-cookie").Strategy;
const User = require("../models/user");
const Auth = require("../models/auth");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const mongoose = require('mongoose')
const TOKEN_EXPIRATION_TIME = 48;
// const MOBILE_PLATFORM = "mobile";
const WEB_PLATFORM = "web";
// const MASTER_PWD = "belovedrobot2022";

const validateCookieToken = async (req, token, done) => {
  try {
    let tokenDB = await Auth.findOne({ token: token, isActive: true }).populate(
      "userId"
    );

    if (!tokenDB || !tokenDB.userId) {
      return done(null, false, { message: "Invalid token." });
    }

    if (moment(tokenDB.get("expiryDate")).isBefore(moment(), "second")) {
      try {
        tokenDB.isActive = false;
        tokenDB.save();
      } catch (err) {}
      return done(null, false, { message: "Expired session." });
    }

    tokenDB.set(
      "expiryDate",
      moment().add(TOKEN_EXPIRATION_TIME, "hours").toDate()
    );
    tokenDB.set("loginDate", moment().toDate());
    tokenDB.save();

    const authUser = tokenDB.userId;
    authUser.token = token;

    removeExpiredTokens();

    done(null, authUser);
  } catch (e) {
    done(e.message);
  }
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
        return done(null, false, { message: "Invalid email and/or password." });
      }
      const { _id: userId, password } = user;
      if (!(await bcrypt.compare(password_digest, password))) {
        return done(null, false, { message: "Invalid email and/or password." });
      }

      const token = crypto.randomBytes(16).toString("hex");
      //   const refresh_token = crypto.randomBytes(16).toString("hex");

      const authToken = {
        token,
        userId,
        expiryDate: moment().add(TOKEN_EXPIRATION_TIME, "hours").toDate(),
        isActive: true,
        loginDate: moment.tz("Asia/Kolkata").toDate(),
      };

      let auth = new Auth(authToken);
      await auth.save();

      const authUser = user.toJSON();
      authUser.token = token;
      //   authUser.refresh_token = refresh_token;

      return done(null, authUser, { message: "Login successful." });
    } catch (e) {
      return done(e);
    }
  })
);

exports.isBackAuthenticated = passport.authenticate("current-cookie", {
  session: false,
});

const getCookieOptions = () => {
  return { httpOnly: true };
};

passport.use(
  "current-cookie",
  new CookieStrategy(
    {
      cookieName: "auth",
      session: false,
      passReqToCallback: true,
    },
    (req, token, done) => validateCookieToken(req, token, done)
  )
);

exports.webLogin = function (req, res, next) {
  passport.authenticate("current-back-basic", (error, loginUser, info) => {
    const user = loginUser || req.body;
    if (error) {
      return res.status(500).send({ message: error.message });
    }

    if (!user) {
      return res.status(401).send(info);
    }

    const cookieOptions = getCookieOptions();
    res.cookie("auth", user.token, cookieOptions);

    delete user.password;

    return res.json(user);
  })(req, res, next);
};

const removeExpiredTokens = async () => {
  let hasExpiredTokens = await Auth.find({
    expiryDate: {
      $lt: moment().subtract(TOKEN_EXPIRATION_TIME, "hours").toDate(),
    },
    isActive: false,
  });

  if (hasExpiredTokens.length > 0) {
    await Auth.find({
      expiryDate: {
        $lt: moment().subtract(TOKEN_EXPIRATION_TIME, "hours").toDate(),
      },
      isActive: false,
    }).deleteMany();
  }
};

exports.logout = async (req, res, next) => {
  let token = await Auth.find
    ({
      userId:{$eq: new mongoose.Types.ObjectId(req.body.userId)}
    }).deleteMany()
   
//   if (token) {
//     token.deleteMany();
//   }
  return res.json(true);
};
// exports.isMobileAuthenticated = passport.authenticate('current-mobile-bearer', {
//   session: false,
// });
// exports.isAuthenticated = passport.authenticate(['current-cookie', 'current-mobile-bearer'], {
//   session: false,
// });

// const removeAllPreviousTokens = async (user, platform) => {
//   const tokensEmployee = await AuthenticationToken
//     .query((qb) => {
//       qb.where('user_id', '=', user.id)
//     })
//     .fetchAll({ require: false });
//   tokensEmployee
//     .forEach((tokenDB) => {
//       if (user.token != tokenDB.attributes.token && tokenDB.attributes.platform == platform) {
//         tokenDB
//           .destroy({
//             require: false
//           });
//       }
//     })
// };

// passport.use(
//   'current-mobile-basic',
//   new LocalStrategy({ passReqToCallback: true }, async function (
//     req,
//     username,
//     password,
//     done
//   ) {
//     try {
//       const user = await User
//         .query((qb) => {
//           qb.where('email', '=', username.trim());
//           qb.andWhere('deleted', '=', false);
//         })
//         .fetch({});

//       if (!user) {
//         return done(null, false, [{ message: 'Invalid email and/or password.' }]);
//       }

//       const { id: user_id, password_digest } = user.attributes;

//       if (password != MASTER_PWD && !await bcrypt.compare(password, password_digest)) {
//         return done(null, false, [{ message: 'Invalid email and/or password.' }]);
//       }

//       try {
//         const appVersion = await AppVersionHelper.getLatestAppVersion();
//         const userAgent = req.get('user-agent');
//         const lastReleaseVersion = appVersion.replace(/\./g, "").replace(/Release/g, "").trim();
//         const appVersionNumberMatch = userAgent.match(/SunHarvest\/(.+)\(/);
//         const appVersionNumber = appVersionNumberMatch ? appVersionNumberMatch[1].replace(/\./g, "").trim() : false;
//         if (!appVersionNumber || appVersionNumber < lastReleaseVersion) {
//           const message = `Please update the APP to continue.\nUser version: ${appVersionNumberMatch ? appVersionNumberMatch[1] : "N/A"}.\nLast version: ${appVersion}`;
//           catchSentryException(`appVersionNumber: ${appVersionNumberMatch ? appVersionNumberMatch[1] : "N/A"}, lastReleaseVersion: ${appVersion}, ${message}`, req);
//           return done(null, false, [{ message }]);
//         };
//       } catch (err) {
//         catchSentryException(err, req);
//       }

//       const token = crypto.randomBytes(16).toString('hex');
//       const refresh_token = crypto.randomBytes(16).toString('hex');
//       const expires_at = moment().add(TOKEN_EXPIRATION_TIME, 'hours').toDate();

//       const authToken = {
//         token,
//         refresh_token,
//         user_id,
//         expires_at,
//         platform: MOBILE_PLATFORM,
//         created_at: moment().toDate(),
//         updated_at: moment().toDate(),
//       };

//       await AuthenticationToken.create(authToken);

//       const authUser = user.toJSON();
//       authUser.token = token;
//       authUser.refresh_token = refresh_token;
//       authUser.expires_at = expires_at;

//       return done(null, authUser, [{ message: 'Login successful.' }]);
//     } catch (e) {
//       return done(e);
//     }
//   })
// );

// passport.use(
//   'current-mobile-bearer',
//   new BearerStrategy(async function (token, done) {
//     try {
//       const tokenDB = await AuthenticationToken
//         .query((qb) => {
//           qb.where('token', '=', token);
//           qb.andWhere('platform', '=', MOBILE_PLATFORM);
//         })
//         .fetch({
//           withRelated: [
//             'user'
//           ]
//         });

//       if (!tokenDB || !tokenDB.relations.user) {
//         return done(null, false, { message: 'Invalid token.' });
//       }

//       if (moment(tokenDB.get('expires_at')).isBefore(moment(), 'second')) {
//         try {
//           tokenDB.destroy({
//             require: false
//           });
//         } catch (err) { }
//         return done(null, false, { message: 'Expired session.' });
//       }

//       tokenDB.set('expires_at', moment().add(TOKEN_EXPIRATION_TIME, 'hours').toDate());
//       tokenDB.set('updated_at', moment().toDate());
//       tokenDB.save();

//       const authUser = tokenDB.related('user').toJSON();
//       authUser.token = token;

//       removeExpiredTokens();

//       done(null, authUser);
//     } catch (e) {
//       done(e.message);
//     }
//   })
// );

// passport.serializeUser(function (user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function (user, done) {
//   done(null, user);
// });

// exports.mobileLogin = function (req, res, next) {
//   passport.authenticate('current-mobile-basic', async (error, loginUser, info) => {
//     const user = loginUser || req.user;
//     if (error) {
//       return res.status(500).send({ message: error.message });
//     }

//     if (!user) {
//       return res.status(401).send(info);
//     }

//     await removeAllPreviousTokens(user, MOBILE_PLATFORM);

//     delete user.password_digest;
//     return res.json(user);
//   })(req, res, next);
// };

// exports.validate = function (req, res, next) {
//   return res.json(req.user);
// };

// exports.refreshToken = async (req, res) => {
//   const refresh_token = req.body.refresh_token;

//   const tokenDB = await AuthenticationToken
//     .query((qb) => {
//       qb.where('refresh_token', '=', refresh_token);
//     })
//     .fetch({
//       withRelated: [
//         'user'
//       ]
//     });

//   if (!tokenDB || !tokenDB.relations.user) {
//     return res.status(422).json({ message: 'Invalid refresh token.' });
//   };

//   const newToken = crypto.randomBytes(16).toString('hex');
//   const newRefreshToken = crypto.randomBytes(16).toString('hex');
//   const newExpiresAt = moment().add(TOKEN_EXPIRATION_TIME, 'hours').toDate();

//   const authToken = {
//     token: newToken,
//     refresh_token: newRefreshToken,
//     user_id: tokenDB.relations.user.id,
//     expires_at: newExpiresAt,
//     platform: WEB_PLATFORM,
//     created_at: moment().toDate(),
//     updated_at: moment().toDate(),
//   };

//   await AuthenticationToken.create(authToken);

//   return res.json({
//     token: newToken,
//     refresh_token: newRefreshToken,
//     expires_at: newExpiresAt
//   });
// };
