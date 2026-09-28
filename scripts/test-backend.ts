/**
 * scripts/test-backend.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend API Integration Test Suite
 * Tests all 4 Next.js API endpoints against http://localhost:3000
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, detail: string) {
  if (condition) {
    console.log(`  ✅ PASSED: ${testName} (${detail})`);
    results.push({ name: testName, passed: true, details: detail });
  } else {
    console.error(`  ❌ FAILED: ${testName} (${detail})`);
    results.push({ name: testName, passed: false, details: detail });
  }
}

async function testGenerateEndpoint() {
  console.log('\n🔍 Testing POST /api/generate...');

  // 1. Invalid payload test
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: 'tech' }), // missing platform and format
    });
    assert(res.status === 400, 'POST /api/generate Validation', `Expected 400 for missing fields, got ${res.status}`);
  } catch (err: unknown) {
    assert(false, 'POST /api/generate Validation', `Request failed: ${err}`);
  }

  // 2. Valid payload test
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: 'fitness', platform: 'Instagram', format: 'Reel' }),
    });
    const data = await res.json();
    const hasKeys = typeof data.memoryUsed === 'boolean' && data.caption !== undefined;
    assert(res.status === 200 && hasKeys, 'POST /api/generate Functional Test', `Status ${res.status}, response keys valid`);
  } catch (err: unknown) {
    assert(false, 'POST /api/generate Functional Test', `Request failed: ${err}`);
  }
}

async function testLogPerformanceEndpoint() {
  console.log('\n🔍 Testing POST /api/log-performance...');

  // 1. Invalid payload test
  try {
    const res = await fetch(`${BASE_URL}/api/log-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: 'Sample post' }), // missing platform, format
    });
    assert(res.status === 400, 'POST /api/log-performance Validation', `Expected 400 for missing fields, got ${res.status}`);
  } catch (err: unknown) {
    assert(false, 'POST /api/log-performance Validation', `Request failed: ${err}`);
  }

  // 2. Valid payload test
  try {
    const res = await fetch(`${BASE_URL}/api/log-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: 'Top 3 leg day mistakes to avoid! #fitness',
        platform: 'Instagram',
        format: 'Reel',
        likes: 350,
        comments: 42,
        saves: 85,
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'POST /api/log-performance Functional Test', `Status ${res.status}, engagement label: "${data.engagementLabel}"`);
  } catch (err: unknown) {
    assert(false, 'POST /api/log-performance Functional Test', `Request failed: ${err}`);
  }
}

async function testInsightsEndpoint() {
  console.log('\n🔍 Testing GET /api/insights...');

  try {
    const res = await fetch(`${BASE_URL}/api/insights`, {
      method: 'GET',
    });
    const data = await res.json();
    const isValid = Array.isArray(data.insights) && typeof data.memoriesCount === 'number';
    assert(res.status === 200 && isValid, 'GET /api/insights Functional Test', `Status ${res.status}, returned ${data.insights?.length ?? 0} insights, ${data.memoriesCount} memories`);
  } catch (err: unknown) {
    assert(false, 'GET /api/insights Functional Test', `Request failed: ${err}`);
  }
}

async function testDemoEndpoint() {
  console.log('\n🔍 Testing POST /api/demo...');

  // 1. Invalid payload test
  try {
    const res = await fetch(`${BASE_URL}/api/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, 'POST /api/demo Validation', `Expected 400 for empty topic, got ${res.status}`);
  } catch (err: unknown) {
    assert(false, 'POST /api/demo Validation', `Request failed: ${err}`);
  }

  // 2. Valid payload test
  try {
    const res = await fetch(`${BASE_URL}/api/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'morning workout routine' }),
    });
    const data = await res.json();
    const isValid = data.fresh !== undefined && data.trained !== undefined && typeof data.memoriesCount === 'number';
    assert(res.status === 200 && isValid, 'POST /api/demo Functional Test', `Status ${res.status}, fresh & trained agents returned responses`);
  } catch (err: unknown) {
    assert(false, 'POST /api/demo Functional Test', `Request failed: ${err}`);
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 Running Creatorly Backend API Integration Tests');
  console.log('====================================================');

  await testGenerateEndpoint();
  await testLogPerformanceEndpoint();
  await testInsightsEndpoint();
  await testDemoEndpoint();

  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`📊 Test Summary: ${passedCount}/${totalCount} tests passed.`);
  console.log('====================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runAllTests();
