const WebRouter = require("express").Router();
const Validator = require('../validators/role');
const Controller = require("../controllers/role");
const { validate } = require('../validators/middlewareValidator');

// WebRouter.get('/', Validator.getUsers, validate, Controller.getUsers);
// WebRouter.get('/:id', Validator.getUsers, validate, Controller.getUser);
WebRouter.get('/', Controller.getRoles);
WebRouter.post("/", Validator.createRole, validate, Controller.createRole);
// WebRouter.put('/:id', Validator.updateUser, validate, Controller.updateUser);
// WebRouter.put('/:id/work-performed-table-columns-setting', Validator.updateUserWorkPerformedTableColumnsSetting, validate, Controller.updateUserWorkPerformedTableColumnsSetting);
WebRouter.delete('/:id', validate, Controller.deleteRole);

module.exports = {
  WebRouter,
};
