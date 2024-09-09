import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const productController = new ProductController(prisma);

router.get('/', productController.getAllProducts.bind(productController)); // Binding ensures the correct `this` context
router.get('/:id', productController.getProductById.bind(productController));
router.post('/', productController.createProduct.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));

export default router;
