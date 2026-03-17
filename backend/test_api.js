const axios = require('axios');

async function testApi() {
    try {
        console.log('Logging in to get token...');
        // Need credentials for a student
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'student@example.com', // Need to check if this exists or create one
            password: 'student123',
            role: 'student'
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in successfully');

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const testsRes = await axios.get('http://localhost:5000/api/user/tests', config);
        console.log('Tests received:', testsRes.data.length);
        console.log('First test status:', testsRes.data.length > 0 ? testsRes.data[0].status : 'N/A');

    } catch (err) {
        console.error('❌ API Test Failed:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}

testApi();
