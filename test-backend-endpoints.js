#!/usr/bin/env node

// Quick test script to verify backend endpoints are working
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5002';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Eco-Lens Backend Endpoints...\n');
  
  const endpoints = [
    { name: 'Health Check', url: `${BASE_URL}/api/health` },
    { name: 'Database Status', url: `${BASE_URL}/api/db-status` },
    { name: 'Cart API (Auth Required)', url: `${BASE_URL}/api/cart` },
    { name: 'Products API', url: `${BASE_URL}/api/products` },
    { name: 'Rating API (Auth Required)', url: `${BASE_URL}/api/ratings/pending-ratings` },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const result = await makeRequest(endpoint.url);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint.name}: OK`);
        if (endpoint.name === 'Health Check') {
          console.log(`   Database: ${result.data.database?.connected ? 'Connected' : 'Disconnected'}`);
        }
      } else if (result.status === 401) {
        console.log(`✅ ${endpoint.name}: OK (Auth Required)`);
      } else {
        console.log(`❌ ${endpoint.name}: Status ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 Backend testing complete!');
  console.log('\n📱 Next steps:');
  console.log('1. Open your Expo Go app on your phone');
  console.log('2. Scan the QR code from the terminal');
  console.log('3. Test the app with the local backend');
  console.log('4. Try adding items to cart and rating products!');
}

testEndpoints().catch(console.error);
