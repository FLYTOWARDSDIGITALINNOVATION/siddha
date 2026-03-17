const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODQ0NDgxYjZmNzc3Y2QzYTFjMTRjYyIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzczNzI5NjcwLCJleHAiOjE3NzM4MTYwNzB9.HnhM095pz30DKl-Um6Dx0W8i-06uUEo_ZDoTKxwNSRE';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/user/tests',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
