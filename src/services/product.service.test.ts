import { ProductService } from './product.service'
import { Product } from '../models/product.model'

// Mock Prisma client
jest.mock('../models/product.model')

describe('ProductService', () => {
  let productService: ProductService
  let mockProductModel: jest.Mocked<Product>

  beforeEach(() => {
    productService = new ProductService()
    mockProductModel = new Product() as jest.Mocked<Product>
  })

  it('should create a product', async () => {
    mockProductModel.createProduct = jest.fn().mockResolvedValue({ name: 'Test Product', price: 100 })

    const result = await productService.createProduct('Test Product', 100)
    expect(result.name).toBe('Test Product')
    expect(result.price).toBe(100)
  })

  it('should fetch all products', async () => {
    mockProductModel.getAllProducts = jest.fn().mockResolvedValue([{ name: 'Product 1', price: 50 }])

    const products = await productService.getAllProducts()
    expect(products.length).toBe(1)
    expect(products[0].name).toBe('Product 1')
  })
})
