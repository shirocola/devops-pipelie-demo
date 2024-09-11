import request from 'supertest';
import App from '../../src/app';

describe('E2E Test', () => {
    const app = new App().app;

    it('should create and fetch a product', async () => {
        const productData = { name: 'New Product', price: 200 };

        // Create a product
        const res = await request(app).post('/products').send(productData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual(productData.name);

        // Fetch the product
        const fetchRes = await request(app).get(`/products/${res.body.id}`);
        expect(fetchRes.statusCode).toEqual(200);
        expect(fetchRes.body.name).toEqual(productData.name);
    });
});
