import request from 'supertest';
import App from '../../src/app';

describe('Product API', () => {
    const app = new App().app;

    it('GET /products should return list of products', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});
