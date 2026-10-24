import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { truncateTestDatabase } from '../setup/test-db.js';
import { createAuthenticatedUser } from '../factories/auth.helper.js';
import { createTestListing } from '../factories/listing.factory.js';

describe('E2E: Moderation Flow', () => {
  const app = createApp();

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  it('should auto-hide listing when 3 distinct users report it', async () => {
    // 1. Create seller and active listing
    const seller = await createAuthenticatedUser({
      firstName: 'Seller',
      lastName: 'ListingAuthor',
      verificationStatus: 'verified',
    });

    const listing = await createTestListing({
      createdById: seller.user.id,
      title: 'Suspicious Electronics Bundle Post',
      description: 'Brand new iPhones for 1000 ETB. Too good to be true campus deal.',
      price: 1000,
    });

    // 2. Create 3 distinct reporters
    const reporter1 = await createAuthenticatedUser({ firstName: 'Student', lastName: 'One' });
    const reporter2 = await createAuthenticatedUser({ firstName: 'Student', lastName: 'Two' });
    const reporter3 = await createAuthenticatedUser({ firstName: 'Student', lastName: 'Three' });

    // 3. First report: listing remains active
    const report1Res = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', reporter1.authHeader)
      .send({
        reportType: 'listing',
        targetId: listing.id,
        category: 'fraud',
        description: 'Listing offers high-end electronics at an impossibly low price.',
      });

    assert.equal(report1Res.status, 201);
    assert.equal(report1Res.body.success, true);

    const check1Res = await request(app).get(`/api/v1/listings/${listing.id}`);
    assert.equal(check1Res.status, 200);
    assert.equal(check1Res.body.data.status, 'active');

    // 4. Second report: listing still remains active
    const report2Res = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', reporter2.authHeader)
      .send({
        reportType: 'listing',
        targetId: listing.id,
        category: 'fraud',
        description: 'Suspected scam targeting freshman students outside dorms.',
      });

    assert.equal(report2Res.status, 201);
    assert.equal(report2Res.body.success, true);

    const check2Res = await request(app).get(`/api/v1/listings/${listing.id}`);
    assert.equal(check2Res.status, 200);
    assert.equal(check2Res.body.data.status, 'active');

    // 5. Third report: reaches threshold (3) -> auto-hidden!
    const report3Res = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', reporter3.authHeader)
      .send({
        reportType: 'listing',
        targetId: listing.id,
        category: 'counterfeit',
        description: 'Confirmed fake merchandise reported by multiple dorm peers.',
      });

    assert.equal(report3Res.status, 201);
    assert.equal(report3Res.body.success, true);

    // 6. Check listing detail: status is now 'hidden'
    const check3Res = await request(app).get(`/api/v1/listings/${listing.id}`);
    assert.equal(check3Res.status, 200);
    assert.equal(check3Res.body.data.status, 'hidden');

    // 7. Verify listing disappears from public search results
    const searchRes = await request(app).get('/api/v1/listings');
    assert.equal(searchRes.status, 200);
    assert.equal(
      searchRes.body.data.items.some((item: any) => item.id === listing.id),
      false
    );
  });
});
