const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');


router.post(`/register`, userCtrl.register);

router.post('/login', userCtrl.login);

router.post('/add', userCtrl.addCart);

router.post('/delete', userCtrl.deleteItem);

router.post('/deleteAll', userCtrl.deleteAllItem);

router.get('/logout', userCtrl.logout);

router.get(`/refresh_token`, userCtrl.refreshToken);

router.post('/info',  userCtrl.getUser);

module.exports = router;