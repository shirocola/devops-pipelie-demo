import request from 'supertest';
import { server, app } from '../../app';
import prisma from '../../config/prisma';

describe('Product API Integration Test', () => {
  beforeAll(async () => {
    await prisma.product.deleteMany(); // Clean up database before tests
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Disconnect Prisma
    server.close(); // Close the server to free the port
  });

  it('should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Integration Product', price: 100 });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Integration Product');
  });

  it('should get all products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
