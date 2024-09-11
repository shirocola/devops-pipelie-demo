import { ProductService } from '../../src/services/product.service';
import { ProductRepository } from '../../src/repositories/product.repository';
import { Product } from '@prisma/client'; // Import Product type from Prisma

describe('ProductService', () => {
    let productService: ProductService;
    let productRepository: ProductRepository;

    beforeEach(() => {
        productRepository = new ProductRepository();
        productService = new ProductService(productRepository);
    });

    it('should fetch all products', async () => {
        const mockProducts: Product[] = [  // Use Prisma's Product type
            { 
                id: 1, 
                name: 'Product 1', 
                price: 100,
                createdAt: new Date(), // Prisma's Product type includes createdAt
            },
        ];

        jest.spyOn(productRepository, 'findAll').mockResolvedValueOnce(mockProducts);

        const products = await productService.getAllProducts();
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Product 1');
        expect(products[0].createdAt).toBeInstanceOf(Date); // Test the 'createdAt' field
    });
});
