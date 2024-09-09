import request from 'supertest';
import { server, app } from '../../app';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

describe('Product E2E Test', () => {
  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.product.deleteMany(); // Clean up database before tests
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Disconnect Prisma
    server.close(); // Close the server to free the port
  });

  it('should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'E2E Product', price: 100 });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('E2E Product');
  });

  it('should get all products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
