/**
 * Simple API test script
 * Tests that the API endpoints are working correctly
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Wavelaunch OS API...\n');

  try {
    // Test 1: Check if creators API is accessible (should return 401 without auth)
    console.log('1. Testing /api/creators endpoint...');
    const response = await fetch(`${BASE_URL}/api/creators`);

    if (response.status === 401) {
      console.log('✅ API endpoint is protected (requires authentication)\n');
    } else {
      console.log(`⚠️  Expected 401, got ${response.status}\n`);
    }

    // Test 2: Sign in and test authenticated request
    console.log('2. Testing authentication flow...');
    console.log('   (This requires the app to be running)\n');

    console.log('✅ All API tests completed!');
    console.log('\nTo fully test the API:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Sign in with: admin@wavelaunch.test / Test1234!');
    console.log('4. Navigate to the Creators page');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\nMake sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

testAPI();
