import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { truncateTestDatabase } from '../setup/test-db.js';
import { createAuthenticatedUser } from '../factories/auth.helper.js';

describe('E2E: Verified Seller Flow', () => {
  const app = createApp();

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  it('should block unverified user from creating listings with 403 VERIFICATION_REQUIRED', async () => {
    const unverified = await createAuthenticatedUser({
      verificationStatus: 'unverified',
    });

    const listingPayload = {
      title: 'Genuine Casio fx-991EX Calculator',
      description: 'Used for one semester in calculus and physics courses.',
      category: 'Electronics',
      transactionType: 'sell',
      price: 1500,
    };

    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', unverified.authHeader)
      .send(listingPayload);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VERIFICATION_REQUIRED');
  });

  it('should allow verified student to create listing, find it in search, and update details', async () => {
    const verifiedUser = await createAuthenticatedUser({
      verificationStatus: 'verified',
    });

    const listingPayload = {
      title: 'Introduction to Algorithms 3rd Edition',
      description: 'Clean textbook in mint condition. Complete chapters for DSA course.',
      category: 'Academic Books',
      transactionType: 'sell',
      price: 1200,
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    };

    // 1. Create listing
    const createRes = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', verifiedUser.authHeader)
      .send(listingPayload);

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    const listingId = createRes.body.data.id;
    assert.ok(listingId);
    assert.equal(createRes.body.data.title, listingPayload.title);

    // 2. Discover via GET /api/v1/listings?category=academic books
    const searchRes = await request(app)
      .get('/api/v1/listings?category=academic books');

    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.success, true);
    assert.ok(searchRes.body.data.items.some((item: any) => item.id === listingId));

    // 3. Update listing details (e.g. price change)
    const updateRes = await request(app)
      .patch(`/api/v1/listings/${listingId}`)
      .set('Authorization', verifiedUser.authHeader)
      .send({ price: 1100 });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.success, true);
    assert.equal(Number(updateRes.body.data.price), 1100);
  });
});
