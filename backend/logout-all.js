const fetch = require('node-fetch');

const API_URL = 'http://192.168.217.1:8001/api/auth/logout-all';

fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(res => res.json())
  .then(data => console.log('✅', data.message))
  .catch(err => console.error('❌ Error:', err.message));
