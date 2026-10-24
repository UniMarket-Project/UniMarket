import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { truncateTestDatabase } from '../setup/test-db.js';

describe('E2E: Auth Flow', () => {
  const app = createApp();

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  it('should register a new student user and return JWT tokens', async () => {
    const payload = {
      email: `test.student.${Date.now()}@aau.edu.et`,
      phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      firstName: 'Abebe',
      lastName: 'Bikila',
      userType: 'student',
      universityCode: 'AAU',
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, payload.email);
    assert.equal(res.body.data.user.userType, 'student');
    assert.ok(res.body.data.accessToken);
    assert.ok(res.headers['set-cookie']);
  });

  it('should reject registration when email is already taken', async () => {
    const email = `test.duplicate.${Date.now()}@aau.edu.et`;
    const payload = {
      email,
      phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      firstName: 'Abebe',
      lastName: 'Bikila',
      userType: 'student',
    };

    const firstRes = await request(app).post('/api/v1/auth/register').send(payload);
    assert.equal(firstRes.status, 201);

    const duplicateRes = await request(app).post('/api/v1/auth/register').send({
      ...payload,
      phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
    });
    assert.equal(duplicateRes.status, 409);
    assert.equal(duplicateRes.body.success, false);
  });

  it('should login an existing user and fetch profile from /users/me', async () => {
    const email = `test.login.${Date.now()}@aau.edu.et`;
    const password = 'Password123!';

    await request(app).post('/api/v1/auth/register').send({
      email,
      phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
      password,
      firstName: 'Chaltu',
      lastName: 'Kebede',
      userType: 'student',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    const token = loginRes.body.data.accessToken;
    assert.ok(token);

    // Retrieve current user profile
    const meRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.data.email, email);
    assert.equal(meRes.body.data.firstName, 'Chaltu');
  });

  it('should reject login with invalid credentials', async () => {
    const email = `test.invalid.${Date.now()}@aau.edu.et`;
    await request(app).post('/api/v1/auth/register').send({
      email,
      phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      firstName: 'Invalid',
      lastName: 'Tester',
      userType: 'student',
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword999!' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});
