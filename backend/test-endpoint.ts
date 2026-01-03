
import axios from 'axios';

async function test() {
    try {
        console.log('1. Attempting login...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'sonuraj1abcd@gmail.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Login successful! Token:', token.substring(0, 20) + '...');

        console.log('2. Fetching bookings...');
        const bookingsRes = await axios.get('http://localhost:3000/api/client/bookings', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000 // 5s timeout
        });

        console.log('Bookings fetched:', bookingsRes.data);
    } catch (e: any) {
        if (e.code === 'ECONNABORTED') {
            console.error('Request timed out!');
        } else {
            console.error('Test failed:', e.message);
            if (e.response) {
                console.error('Status:', e.response.status);
                console.error('Data:', e.response.data);
            }
        }
    }
}

test();
