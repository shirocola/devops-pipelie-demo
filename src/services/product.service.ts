import { PrismaClient } from '@prisma/client';

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async getAllProducts() {
    return await this.prisma.product.findMany();
  }

  async getProductById(id: number) {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  async createProduct(name: string, price: number) {
    return await this.prisma.product.create({
      data: { name, price },
    });
  }

  async updateProduct(id: number, name: string, price: number) {
    return await this.prisma.product.update({
      where: { id },
      data: { name, price },
    });
  }

  async deleteProduct(id: number) {
    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
