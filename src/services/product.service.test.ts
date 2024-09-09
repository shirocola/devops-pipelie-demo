import { PrismaClient } from '@prisma/client';
import { ProductService } from './product.service';

// Mocking PrismaClient's product methods with jest.fn()
const prismaMock = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService(prismaMock); // Inject the mocked Prisma client
  });

  it('should create a product', async () => {
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      price: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Correctly mock the return value for prisma.product.create
    (prismaMock.product.create as jest.Mock).mockResolvedValue(mockProduct);

    const result = await productService.createProduct('Test Product', 100);
    expect(result.name).toBe('Test Product');
    expect(result.price).toBe(100);
  });

  it('should fetch all products', async () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Product 1',
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Correctly mock the return value for prisma.product.findMany
    (prismaMock.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    const products = await productService.getAllProducts();
    expect(products.length).toBe(1);
    expect(products[0].name).toBe('Product 1');
  });
});
