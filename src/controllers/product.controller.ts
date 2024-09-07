import { Request, Response } from 'express'
import { ProductService } from '../services/product.service'

export class ProductController {
  private productService = new ProductService()

  async getAllProducts(req: Request, res: Response) {
    const products = await this.productService.getAllProducts()
    res.json(products)
  }

  async getProductById(req: Request, res: Response) {
    const product = await this.productService.getProductById(+req.params.id)
    res.json(product)
  }

  async createProduct(req: Request, res: Response) {
    const { name, price } = req.body
    const newProduct = await this.productService.createProduct(name, price)
    res.status(201).json(newProduct)
  }

  async updateProduct(req: Request, res: Response) {
    const { name, price } = req.body
    const updatedProduct = await this.productService.updateProduct(+req.params.id, name, price)
    res.json(updatedProduct)
  }

  async deleteProduct(req: Request, res: Response) {
    await this.productService.deleteProduct(+req.params.id)
    res.status(204).send()
  }
}
