// index.js
const express = require("express");
const app = express();
const passport = require('passport')
const PORT = process.env.PORT || 1313;

const routes = require("./routes");
const cookieParser = require("cookie-parser");
require('./dbconnection')

app.use(express.json());
app.set("port", PORT);
app.use(passport.initialize());
app.use(cookieParser());

routes(app);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

