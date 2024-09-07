import { Router } from 'express'
import { ProductController } from '../controllers/product.controller'

const productController = new ProductController()
const router = Router()

router.get('/products', (req, res) => productController.getAllProducts(req, res))
router.get('/products/:id', (req, res) => productController.getProductById(req, res))
router.post('/products', (req, res) => productController.createProduct(req, res))
router.put('/products/:id', (req, res) => productController.updateProduct(req, res))
router.delete('/products/:id', (req, res) => productController.deleteProduct(req, res))

export default router
