import { PrismaClient } from '@prisma/client';

export class PrismaService {
    public prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
        this.connect();
    }

    private async connect() {
        try {
            await this.prisma.$connect();
            console.log('Connected to the database');
        } catch (error) {
            console.error('Error connecting to the database', error);
        }
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}
