import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
let token = '';
const testEmail = `tester_phase2_${Date.now()}@example.com`;

async function test() {
    try {
        console.log('--- 1. Signup & Login ---');
        await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test User Phase 2',
            email: testEmail,
            password: 'password123'
        });
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: 'password123'
        });

        token = loginRes.data.token;
        console.log('Logged in.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('\n--- 2. Add Contact ---');
        const contactRes = await axios.post(`${API_URL}/marketing/contacts`, {
            email: `contact_v2_${Date.now()}@test.com`,
            firstName: 'Alice',
            lastName: 'Smith',
            consent_source: 'test_script_v2'
        }, config);
        const contactId = contactRes.data.data._id;
        console.log('Contact added:', contactRes.data.data.email);

        console.log('\n--- 3. Get All Contacts ---');
        const contactsRes = await axios.get(`${API_URL}/marketing/contacts`, config);
        console.log('Total contacts:', contactsRes.data.length);

        console.log('\n--- 4. Create List ---');
        const listRes = await axios.post(`${API_URL}/marketing/lists`, {
            name: 'V2 Test List',
            contacts: [contactId]
        }, config);
        console.log('List created:', listRes.data.data.name);

        console.log('\n--- 5. Get Lists ---');
        const getListsRes = await axios.get(`${API_URL}/marketing/lists`, config);
        console.log('Lists found:', getListsRes.data.length);
        console.log('List Content:', JSON.stringify(getListsRes.data[0], null, 2));

        console.log('\n--- 6. Create Segment ---');
        const segmentRes = await axios.post(`${API_URL}/marketing/segments`, {
            name: 'V2 Test Segment',
            criteria: { city: 'New York' },
            contacts: [contactId]
        }, config);
        console.log('Segment created:', segmentRes.data.data.name);

        console.log('\n--- 7. Get Segments ---');
        const getSegmentsRes = await axios.get(`${API_URL}/marketing/segments`, config);
        console.log('Segments found:', getSegmentsRes.data.length);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

test();
