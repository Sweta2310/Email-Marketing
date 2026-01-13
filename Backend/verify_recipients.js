import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
let token = '';
let campaignId = '';
let contactId = '';
const testEmail = `tester_${Date.now()}@example.com`;

async function test() {
    try {
        console.log('--- 1. Signup & Login ---');
        await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test User',
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
            email: `contact_${Date.now()}@test.com`,
            firstName: 'John',
            lastName: 'Doe',
            consent_source: 'test_script'
        }, config);
        contactId = contactRes.data.data._id;
        console.log('Contact added:', contactRes.data.data.email);

        console.log('\n--- 3. Search Contacts ---');
        const searchRes = await axios.get(`${API_URL}/marketing/contacts/search?q=John`, config);
        console.log('Search results count:', searchRes.data.length);

        console.log('\n--- 4. Create Campaign ---');
        const campaignRes = await axios.post(`${API_URL}/campaigns`, {
            name: 'Test Recipient Selection'
        }, config);
        campaignId = campaignRes.data._id;
        console.log('Campaign created:', campaignId);

        console.log('\n--- 5. Save Recipients (Individual) ---');
        const recipRes = await axios.post(`${API_URL}/campaigns/${campaignId}/recipients`, {
            type: 'individual',
            contacts: [contactId]
        }, config);
        console.log('Recipients saved:', recipRes.data.message);

        console.log('\n--- 6. Execute Campaign ---');
        const execRes = await axios.post(`${API_URL}/campaigns/${campaignId}/send`, {}, config);
        console.log('Execution result:', execRes.data.message);
        console.log('Stats:', execRes.data.stats);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

test();
