import axios from "axios";

async function testBulkSend() {
    const API_URL = "http://localhost:8000/api/v1/send-bulk-email"; // Server runs on 8000
    const API_KEY = "abc123";

    // const payload = {
        emails: [
            {
                to: "recipient1@example.com",
                subject: "Bulk Test 1",
                text: "Hello from bulk test 1",
                html: "<h1>Bulk Test 1</h1><p>Hello from bulk test 1</p>"
            },
            {
                to: "recipient2@example.com",
                subject: "Bulk Test 2",
                text: "Hello from bulk test 2",
                html: "<h1>Bulk Test 2</h1><p>Hello from bulk test 2</p>"
            },
            {
                to: "test@nonexistent-domain-xyz-123.com",
                subject: "Bulk Test Non-existent Domain",
                text: "This should fail domain validation"
            },
            {
                to: "invalid-email-format",
                subject: "Bulk Test Invalid",
                text: "This should fail validation"
            },
            {
                to: "recipient3@example.com",
                subject: "Bulk Test 3",
                text: "Hello from bulk test 3"
            }
        ]
    // };

    try {
        // console.log("Sending bulk emails...");
        const response = await axios.post(API_URL, payload, {
            headers: {
                "x-api-key": API_KEY
            }
        });

        // console.log("Response Status:", response.status);
        // console.log("Response Body:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error("Error Response Status:", error.response.status);
            console.error("Error Response Data:", error.response.data);
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testBulkSend();
