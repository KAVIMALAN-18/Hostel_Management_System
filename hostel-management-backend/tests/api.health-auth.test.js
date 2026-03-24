const request = require('supertest');
const createApp = require('../app');

describe('API smoke tests', () => {
    const app = createApp();

    test('GET /api/health returns healthy payload', async () => {
        const res = await request(app).get('/api/health');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('API is healthy');
        expect(res.body).toHaveProperty('timestamp');
    });

    test('POST /api/auth/register validates payload', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: '', email: 'bad-email', password: '123', phone: '12' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login validates payload', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bad-email', password: '' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
