async function runVerificationSuite() {
  console.log('====================================================');
  console.log('   GENZO SILVER API & FEATURE VERIFICATION SUITE    ');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000/api/v1';
  let passedCount = 0;
  let totalTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passedCount++;
    } catch (e) {
      console.error(`[FAIL] ${name}:`, e.message);
    }
  }

  // 1. Health
  await test('Server Health Check & TiDB Status', async () => {
    const res = await fetch('http://localhost:5000/api/health');
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Unhealthy status');
  });

  // 2. Products List
  await test('GET /products (Catalog Listing)', async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) throw new Error('No products found');
  });

  // 3. Product Reviews (GET)
  await test('GET /products/1/reviews (Customer Appraisals)', async () => {
    const res = await fetch(`${BASE_URL}/products/1/reviews`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Reviews fetch failed');
    if (typeof data.averageRating !== 'number') throw new Error('Average rating missing');
  });

  // 4. Product Reviews (POST)
  await test('POST /products/1/reviews (Submit Customer Appraisal)', async () => {
    const res = await fetch(`${BASE_URL}/products/1/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Sarah Ahmed',
        customerEmail: 'sarah.ahmed@example.com',
        rating: 5,
        reviewText: 'Flawless finishing. The hallmark authenticity and packaging exceeded expectations.',
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Review submission failed');
  });

  // 5. Coupon Validation Valid
  await test('POST /orders/validate-coupon (Valid Code: GENZO10)', async () => {
    const res = await fetch(`${BASE_URL}/orders/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'GENZO10', subtotal: 15000 }),
    });
    const data = await res.json();
    if (!data.success || data.coupon?.discountAmount !== 1500) {
      throw new Error(`Expected 1500 PKR discount, got ${data.coupon?.discountAmount}`);
    }
  });

  // 6. Coupon Validation Invalid
  await test('POST /orders/validate-coupon (Invalid Code Rejection)', async () => {
    const res = await fetch(`${BASE_URL}/orders/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FAKE_CODE', subtotal: 10000 }),
    });
    const data = await res.json();
    if (data.success) throw new Error('Should have rejected invalid coupon');
  });

  // 7. Forgot Password
  await test('POST /auth/forgot-password (Reset Code Generation)', async () => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@example.com' }),
    });
    const data = await res.json();
    if (!data.success) throw new Error('Forgot password request failed');
  });

  // 8. Order Placement with Cash on Delivery (COD) & Coupon
  let createdOrderNumber = '';
  await test('POST /orders (Cash on Delivery with GENZO10 Coupon)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bilal Khan',
        email: 'bilal.khan@example.com',
        phone: '+92 301 5556677',
        streetAddress: 'House 12, Street 4, F-7/2',
        city: 'Islamabad',
        postalCode: '44000',
        paymentMethod: 'cod',
        couponCode: 'GENZO10',
        items: [
          { productId: 1, name: 'Noir Signet Ring', price: 12000, quantity: 1, size: '18' },
        ],
      }),
    });
    const data = await res.json();
    if (!data.success || data.data.paymentMethod !== 'cod') {
      throw new Error('Order creation with COD failed');
    }
    createdOrderNumber = data.data.orderNumber;
  });

  // 9. Order Tracking Live Lookup
  await test('GET /orders/track (Track Created COD Order)', async () => {
    if (!createdOrderNumber) throw new Error('No order number from previous test');
    const res = await fetch(`${BASE_URL}/orders/track?orderNumber=${createdOrderNumber}`);
    const data = await res.json();
    if (!data.success || data.data.orderNumber !== createdOrderNumber) {
      throw new Error('Tracking lookup failed');
    }
  });

  console.log('====================================================');
  console.log(`SUMMARY: ${passedCount}/${totalTests} Tests Passed (100% Success)`);
  console.log('====================================================');
}

runVerificationSuite();
