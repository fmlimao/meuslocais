const express = require('express');
const router = express.Router();

// router.get('/', (req, res) => {
//     res.redirect('/admin/v1');
// });

// router.use('/admin/v1', require('./v1/routes-admin'));

router.use('/api/v1', require('./v1/routes-api'));

module.exports = router;
