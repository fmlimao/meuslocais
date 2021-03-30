const express = require('express');
const router = express.Router();

const maintenanceMiddleware = require('./middlewares/api/maintenance');
const authMiddleware = require('./middlewares/api/auth');
// const getAreaMiddleware = require('./middlewares/api/get-area');
// const getSubareaMiddleware = require('./middlewares/api/get-subarea');

router.use(maintenanceMiddleware);

router.get('/', require('./controllers/api/home'));

router.post('/auth', require('./controllers/api/auth/auth'));

router.use(authMiddleware);

router.get('/users', require('./controllers/api/users/list'));

// router.get('/areas', require('./controllers/api/areas/list'));
// router.post('/areas', require('./controllers/api/areas/store'));
// router.get('/areas/:D001_AreasID', getAreaMiddleware, require('./controllers/api/areas/show'));
// router.put('/areas/:D001_AreasID', getAreaMiddleware, require('./controllers/api/areas/update'));
// router.delete('/areas/:D001_AreasID', getAreaMiddleware, require('./controllers/api/areas/remove'));

// router.get('/subareas', require('./controllers/api/subareas/list'));
// router.post('/subareas', require('./controllers/api/subareas/store'));
// router.get('/subareas/:D001_SubareasID', getSubareaMiddleware, require('./controllers/api/subareas/show'));
// router.put('/subareas/:D001_SubareasID', getSubareaMiddleware, require('./controllers/api/subareas/update'));
// router.delete('/subareas/:D001_SubareasID', getSubareaMiddleware, require('./controllers/api/subareas/remove'));
// router.get('/subareas/:D001_SubareasID/users', getSubareaMiddleware, require('./controllers/api/subareas/users/list'));

// router.get('/users/reload', require('./controllers/api/users/reload'));

// erros 404 e 500
router.use(require('./middlewares/api/error-404'));
router.use(require('./middlewares/api/error-500'));

module.exports = router;
