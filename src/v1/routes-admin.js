const express = require('express');
const router = express.Router();

const authMiddleware = require('./middlewares/admin/auth');

// Autenticação
router.get('/login', require('./controllers/admin/auth/login-get'));
router.post('/login', require('./controllers/admin/auth/login-post'));
router.get('/logout', require('./controllers/admin/auth/logout'));

// Rotas autenticadas
router.use(authMiddleware);

router.get('/', require('./controllers/admin/home'));
router.put('/configs', require('./controllers/admin/configs/update'));

// Áreas
router.get('/areas', require('./controllers/admin/areas/list'));

// Subáreas
router.get('/subareas', require('./controllers/admin/subareas/list'));

// erros 404 e 500
router.use(require('./middlewares/admin/error-404'));
router.use(require('./middlewares/admin/error-500'));

module.exports = router;
