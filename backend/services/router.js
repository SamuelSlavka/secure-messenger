const express = require('express');
const router = express.Router();

const controller = require('./controller');
const api = require('./api');

const dbprefix = 'db';
const apiprefix = 'api';


router.get(`/${dbprefix}/`, controller.getAll);
router.get(`/${apiprefix}/:var`, api.getAll);

router.post(`/${dbprefix}/`, controller.addNew);

module.exports = router;