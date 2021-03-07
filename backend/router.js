
const express = require('express');
const router = express.Router();

// Registered entity routes
router.use(require('./services/router'));

module.exports = router;