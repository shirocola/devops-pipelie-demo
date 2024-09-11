import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const productController = new ProductController();
const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
