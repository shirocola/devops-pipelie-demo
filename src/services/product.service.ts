import { Product } from '../models/product.model'

export class ProductService {
  private productModel = new Product()

  async getAllProducts() {
    return await this.productModel.getAllProducts()
  }

  async getProductById(id: number) {
    return await this.productModel.getProductById(id)
  }

  async createProduct(name: string, price: number) {
    return await this.productModel.createProduct(name, price)
  }

  async updateProduct(id: number, name: string, price: number) {
    return await this.productModel.updateProduct(id, name, price)
  }

  async deleteProduct(id: number) {
    return await this.productModel.deleteProduct(id)
  }
}
