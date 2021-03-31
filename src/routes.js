const express = require('express');
const router = express.Router();

router.get('/', require('./v1/controllers/site/home'));

// router.use('/admin/v1', require('./v1/routes-admin'));

router.use('/api/v1', require('./v1/routes-api'));

module.exports = router;
