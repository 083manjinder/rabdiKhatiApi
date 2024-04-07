// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 1313;
const mongoose = require('./dbconnection')

app.use(express.json());
app.set('port',PORT );




const routes = require('./routes')
routes(app)
mongoose.connection.once('open', () => {
    console.log('Mongoose connection established');
     
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}) })
