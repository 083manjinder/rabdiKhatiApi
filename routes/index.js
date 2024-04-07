const express = require('express');
const user = require('./user')
const role = require('./role')

module.exports = function (app) {

	// Initializing route groups
	const apiRoutes = express.Router(),
		publicRoutes = express.Router();

	// apiRoutes.use('/public', publicRoutes);

	// apiRoutes.use('/auth', authRoutes)
    apiRoutes.use('/users', user.WebRouter)
    apiRoutes.use('/role', role.WebRouter)

    app.use('/api',apiRoutes)
    apiRoutes.get('/', function (req, res, next) {
		res.json({
			api: 'RabdiKhati'
			
		});
	});

}