const WebRouter = require('express').Router();
const Validator = require('../validators/user');
const Controller = require('../controllers/user');

const { validate } = require('../validators/middlewareValidator');


WebRouter.get('/',Validator.getUsers, validate, Controller.getUsers);
WebRouter.get('/:id', Validator.getUsers, validate, Controller.getUser);
// WebRouter.get('/roles', Controller.getRoles);
WebRouter.post('/',Validator.createUser, validate,Controller.createUser);
WebRouter.put('/:id', Validator.updateUser, validate, Controller.updateUser);
// WebRouter.put('/:id/work-performed-table-columns-setting', Validator.updateUserWorkPerformedTableColumnsSetting, validate, Controller.updateUserWorkPerformedTableColumnsSetting);
WebRouter.delete('/:id', validate, Controller.deleteUser);

module.exports = {
WebRouter
};