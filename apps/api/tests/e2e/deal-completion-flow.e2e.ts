import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { truncateTestDatabase } from '../setup/test-db.js';
import { createAuthenticatedUser } from '../factories/auth.helper.js';
import { createTestListing } from '../factories/listing.factory.js';

describe('E2E: Deal Completion & Rating Flow', () => {
  const app = createApp();

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  it('should complete full lifecycle: initiate deal, accept, both confirm, and rate peer', async () => {
    // 1. Create verified seller and verified buyer
    const seller = await createAuthenticatedUser({
      firstName: 'Seller',
      lastName: 'Abebe',
      verificationStatus: 'verified',
    });

    const buyer = await createAuthenticatedUser({
      firstName: 'Buyer',
      lastName: 'Chaltu',
      verificationStatus: 'verified',
    });

    // 2. Create listing
    const listing = await createTestListing({
      createdById: seller.user.id,
      title: 'Original Casio fx-991EX ClassWiz Calculator',
      price: 1850,
    });

    // 3. Buyer initiates transaction
    const dealRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', buyer.authHeader)
      .send({
        listingId: listing.id,
        amount: 1850,
        paymentMethod: 'cash',
        notes: 'Can meet at 4-Kilo library today',
      });

    assert.equal(dealRes.status, 201);
    assert.equal(dealRes.body.success, true);
    const dealId = dealRes.body.data.id;
    assert.equal(dealRes.body.data.status, 'pending');

    // 4. Seller accepts the deal
    const acceptRes = await request(app)
      .post(`/api/v1/transactions/${dealId}/accept`)
      .set('Authorization', seller.authHeader);

    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.body.success, true);
    assert.equal(acceptRes.body.data.status, 'in_progress');

    // 5. Buyer confirms completion
    const buyerConfirmRes = await request(app)
      .post(`/api/v1/transactions/${dealId}/confirm`)
      .set('Authorization', buyer.authHeader)
      .send({ confirmed: true });

    assert.equal(buyerConfirmRes.status, 200);
    assert.equal(buyerConfirmRes.body.success, true);

    // 6. Seller confirms completion -> deal transitions to 'completed'
    const sellerConfirmRes = await request(app)
      .post(`/api/v1/transactions/${dealId}/confirm`)
      .set('Authorization', seller.authHeader)
      .send({ confirmed: true });

    assert.equal(sellerConfirmRes.status, 200);
    assert.equal(sellerConfirmRes.body.success, true);
    assert.equal(sellerConfirmRes.body.data.status, 'completed');

    // 7. Buyer rates the seller (5-star rating)
    const ratingRes = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', buyer.authHeader)
      .send({
        transactionId: dealId,
        rating: 5,
        comment: 'Excellent seller! Genuine calculator in mint condition.',
      });

    assert.equal(ratingRes.status, 201);
    assert.equal(ratingRes.body.success, true);
    assert.equal(ratingRes.body.data.rating, 5);

    // 8. Verify public profile stats updated
    const profileRes = await request(app)
      .get(`/api/v1/ratings/users/${seller.user.id}`);

    assert.equal(profileRes.status, 200);
    assert.equal(profileRes.body.success, true);
    assert.equal(profileRes.body.data.totalRatings, 1);
    assert.equal(profileRes.body.data.averageRating, 5);
  });
});
