const router = require('express').Router();
const productCtrl = require('../controllers/productCtrl');

router.route('/products')
    .get(productCtrl.getProducts)
    .post(productCtrl.createProduct)

router.route('/products/Quantity')
    .get(productCtrl.Quality)

router.route('/products/:id')
    .delete(productCtrl.deleteProduct)
    .put(productCtrl.updateProduct)
    .get(productCtrl.getDetailProduct) 

module.exports = router;