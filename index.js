// index.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 1313;
const mongoose = require("./dbconnection");
const routes = require("./routes");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.set("port", PORT);

app.use(cookieParser());

routes(app);
mongoose.connection.once("open", () => {
  console.log("Mongoose connection established");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
