import request from 'supertest'
import app from '../../app'
import prisma from '../../config/prisma'

describe('Product E2E Test', () => {
  beforeAll(async () => {
    await prisma.product.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create, fetch, and delete a product', async () => {
    // สร้าง Product
    const createResponse = await request(app)
      .post('/api/products')
      .send({ name: 'E2E Product', price: 100 })
    expect(createResponse.status).toBe(201)

    const productId = createResponse.body.id

    // ตรวจสอบการดึง Product
    const fetchResponse = await request(app).get(`/api/products/${productId}`)
    expect(fetchResponse.status).toBe(200)
    expect(fetchResponse.body.name).toBe('E2E Product')

    // ลบ Product
    const deleteResponse = await request(app).delete(`/api/products/${productId}`)
    expect(deleteResponse.status).toBe(204)

    // ตรวจสอบว่าไม่มี Product นี้อีกแล้ว
    const fetchAfterDeleteResponse = await request(app).get(`/api/products/${productId}`)
    expect(fetchAfterDeleteResponse.status).toBe(404)
  })
})
