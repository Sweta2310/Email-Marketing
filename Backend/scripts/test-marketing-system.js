// import axios from "axios";

// async function testMarketingSystem() {
//     const BASE_URL = "http://localhost:8000/api";
//     const AUTH_URL = `${BASE_URL}/auth/login`;
//     const MARKETING_URL = `${BASE_URL}/marketing`;
//     const CAMPAIGN_URL = `${BASE_URL}/v1/send-campaign`;
//     const API_KEY = "abc123";

//     const TEST_EMAIL = `test_${Date.now()}@gmail.com`;
//     const TEST_PASS = "password123";

//     try {
//         // console.log("--- 1. Signing up ---");
//         await axios.post(`${BASE_URL}/auth/signup`, {
//             name: "Test User",
//             email: TEST_EMAIL,
//             password: TEST_PASS
//         });
//         // console.log("Signed up successfully.");

//         // console.log("\n--- 2. Logging in ---");
//         const loginRes = await axios.post(AUTH_URL, {
//             email: TEST_EMAIL,
//             password: TEST_PASS
//         });
//         const token = loginRes.data.token;
//         // console.log("Logged in successfully.");

//         // console.log("\n--- 3. Adding Marketing Emails ---");
//         const headers = { Authorization: `Bearer ${token}` };

//         await axios.post(`${MARKETING_URL}/add`, {
//             email: "kodemindstech@gmail.com",
//             consent_source: "test_script"
//         }, { headers });
//         // console.log("Added kodemindstech@gmail.com");

//         await axios.post(`${MARKETING_URL}/add`, {
//             email: "swetamudaliyar94@gmail.com",
//             consent_source: "test_script"
//         }, { headers });
//         // console.log("Added swetamudaliyar94@gmail.com");

//         // Simulate a bounced email in the list (manual DB update for test)
//         // Note: For now, we'll just test that unregistered emails are filtered out correctly

//         // console.log("\n--- 4. Triggering Targeted Campaign (Strict Mode) ---");
//         const campaignRes = await axios.post(CAMPAIGN_URL, {
//             subject: "Strict Eligibility Test",
//             text: "This campaign should ONLY reach registered marketing emails.",
//             emails: [
//                 "kodemindstech@gmail.com",      // Registered - Should be SENT
//                 "swetamudaliyar94@gmail.com",   // Registered - Should be SENT
//                 "unregistered@gmail.com",       // NOT Registered - Should be BLOCKED (No auto-reg anymore)
//                 TEST_EMAIL                      // Login email NOT registered - Should be BLOCKED
//             ]
//         }, {
//             headers: {
//                 ...headers,
//                 "x-api-key": API_KEY
//             }
//         });

//         // console.log("Campaign Response Status:", campaignRes.status);
//         // console.log("Campaign Summary:", JSON.stringify(campaignRes.data.summary, null, 2));
//         // console.log("Results (Targeted):", JSON.stringify(campaignRes.data.results, null, 2));

//     } catch (error) {
//         if (error.response) {
//             console.error("Error Status:", error.response.status);
//             console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
//         } else if (error.request) {
//             console.error("No response received. Request details:", error.request);
//         } else {
//             console.error("Axios setup error:", error.message);
//         }
//         if (error.stack) console.error("Stack trace:", error.stack);
//     }
// }

// testMarketingSystem();
