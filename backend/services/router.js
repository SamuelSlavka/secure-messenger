const express = require('express');
const router = express.Router();

const controller = require('./controller');
const api = require('./api');

const dbprefix = 'db';
const apiprefix = 'api';


// proxy to api
router.get(`/${apiprefix}/:var`, api.getAll);
// progy to db service
router.get(`/${dbprefix}/`, controller.getAll);
// progy to db service
router.post(`/${dbprefix}/`, controller.addNew);

module.exports = router;