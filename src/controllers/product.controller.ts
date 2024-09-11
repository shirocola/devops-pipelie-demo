import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ProductRepository } from '../repositories/product.repository';

const productService = new ProductService(new ProductRepository());

export class ProductController {
    async getAllProducts(req: Request, res: Response) {
        const products = await productService.getAllProducts();
        return res.json(products);
    }

    async getProductById(req: Request, res: Response) {
        const product = await productService.getProductById(Number(req.params.id));
        return res.json(product);
    }

    async createProduct(req: Request, res: Response) {
        const product = await productService.createProduct(req.body);
        return res.json(product);
    }

    async updateProduct(req: Request, res: Response) {
        const product = await productService.updateProduct(Number(req.params.id), req.body);
        return res.json(product);
    }

    async deleteProduct(req: Request, res: Response) {
        const product = await productService.deleteProduct(Number(req.params.id));
        return res.json(product);
    }
}
