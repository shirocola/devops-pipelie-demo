import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../models/product.model';

export class ProductService {
    constructor(private readonly productRepository: ProductRepository) {}

    getAllProducts(): Promise<Product[]> {
        return this.productRepository.findAll();
    }

    getProductById(id: number): Promise<Product | null> {
        return this.productRepository.findById(id);
    }

    createProduct(data: Product): Promise<Product> {
        return this.productRepository.create(data);
    }

    updateProduct(id: number, data: Partial<Product>): Promise<Product> {
        return this.productRepository.update(id, data);
    }

    deleteProduct(id: number): Promise<Product> {
        return this.productRepository.delete(id);
    }
}
