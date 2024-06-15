const WebRouter = require('express').Router();
const Validator = require('../validators/farm');
const Controller = require('../controllers/farm');

const { validate } = require('../validators/middlewareValidator');


// WebRouter.get('/',Validator.getUsers, validate, Controller.getUsers);
// WebRouter.get('/:id', Validator.getUsers, validate, Controller.getUser);
// WebRouter.get('/roles', Controller.getRoles);
WebRouter.post('/',Validator.createFarm, validate,Controller.createFarm);
// WebRouter.put('/:id', Validator.updateUser, validate, Controller.updateUser);
// WebRouter.put('/:id/work-performed-table-columns-setting', Validator.updateUserWorkPerformedTableColumnsSetting, validate, Controller.updateUserWorkPerformedTableColumnsSetting);
// WebRouter.delete('/:id', validate, Controller.deleteUser);

module.exports = {
WebRouter
};