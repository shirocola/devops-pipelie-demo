import request from 'supertest'
import app from '../index'
import prisma from '../config/prisma'

describe('Product API Integration Test', () => {
  beforeAll(async () => {
    await prisma.product.deleteMany() // ล้างข้อมูลก่อนเริ่มทดสอบ
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Integration Product', price: 100 })

    expect(response.status).toBe(201)
    expect(response.body.name).toBe('Integration Product')
  })

  it('should get all products', async () => {
    const response = await request(app).get('/api/products')
    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(0)
  })
})
