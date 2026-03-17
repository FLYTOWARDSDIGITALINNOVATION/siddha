const jwt = require('jsonwebtoken');
const JWT_SECRET = 'siddha_veda_intelligence_secret_key_2024';

const user = {
    id: '69844481b6f777cd3a1c14cc', // Navani's ID from previous check
    role: 'student'
};

const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
console.log(token);
