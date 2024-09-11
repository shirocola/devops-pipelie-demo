import { PrismaClient } from '@prisma/client';

export class ProductRepository {
    private prisma = new PrismaClient();

    async findAll() {
        return this.prisma.product.findMany();
    }

    async findById(id: number) {
        return this.prisma.product.findUnique({ where: { id } });
    }

    async create(data: { name: string; price: number }) {
        return this.prisma.product.create({ data });
    }

    async update(id: number, data: { name?: string; price?: number }) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async delete(id: number) {
        return this.prisma.product.delete({ where: { id } });
    }
}
