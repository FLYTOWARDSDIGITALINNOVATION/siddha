const axios = require('axios');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODQ0NDgxYjZmNzc3Y2QzYTFjMTRjYyIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzczNzI5NjcwLCJleHAiOjE3NzM4MTYwNzB9.HnhM095pz30DKl-Um6Dx0W8i-06uUEo_ZDoTKxwNSRE';

async function testApi() {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const testsRes = await axios.get('http://localhost:5000/api/user/tests', config);
        console.log('Tests received count:', testsRes.data.length);
        if (testsRes.data.length > 0) {
            console.log('First test title:', testsRes.data[0].title);
        } else {
            console.log('No tests returned from API');
        }
    } catch (err) {
        console.error('❌ API Test Failed:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}

testApi();
