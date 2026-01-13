// import fetch from "node-fetch";
// import "dotenv/config";

// const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;
// const API_KEY = "abc123";

// async function runTest() {
//     console.log("🚀 Starting Campaign Flow Test...");

//     try {
//         // 1. Create Template
//         console.log("\n1. Creating Template...");
//         const templateRes = await fetch(`${BASE_URL}/templates`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
//             body: JSON.stringify({
//                 name: "Welcome Template",
//                 subject: "Welcome to Our Service",
//                 text: "Hello! Thanks for joining.",
//                 html: "<h1>Hello!</h1><p>Thanks for joining.</p>"
//             })
//         });
//         const template = await templateRes.json();
//         console.log("   Template Created:", template._id ? "OK" : template);
//         if (!template._id) throw new Error("Template creation failed");

//         // 2. Create Campaign (from Template)
//         console.log("\n2. Creating Campaign (Draft)...");
//         const campaignRes = await fetch(`${BASE_URL}/campaigns`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
//             body: JSON.stringify({
//                 name: "Welcome Campaign Q1",
//                 templateId: template._id,
//                 recipients: ["test@example.com"] // Self-test (requires valid domain in real scenario)
//                 // In real execution, this might fail sending if domain is invalid, but flow should work.
//             })
//         });
//         const campaign = await campaignRes.json();
//         console.log("   Campaign Created:", campaign._id ? "OK" : campaign);
//         console.log("   Status:", campaign.status);
//         if (!campaign._id) throw new Error("Campaign creation failed");

//         // 3. Edit Campaign
//         console.log("\n3. Editing Campaign...");
//         const editRes = await fetch(`${BASE_URL}/campaigns/${campaign._id}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
//             body: JSON.stringify({
//                 name: "Welcome Campaign Q1 - Final"
//             })
//         });
//         const editedCampaign = await editRes.json();
//         console.log("   Campaign Edited:", editedCampaign.name === "Welcome Campaign Q1 - Final" ? "OK" : "Failed");

//         // 4. Send Campaign
//         console.log("\n4. Executing Campaign...");
//         // Note: This expects at least one recipient to be valid in the system or provided list.
//         // If "test@example.com" is not a valid domain (likely), it will log failure but API should return success (of the job start).
//         const sendRes = await fetch(`${BASE_URL}/campaigns/${campaign._id}/send`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", "x-api-key": API_KEY }
//         });
//         const sendResult = await sendRes.json();
//         console.log("   Execution Result:", sendResult);

//         // 5. Verify Status
//         console.log("\n5. Verifying Campaign Status...");
//         const checkRes = await fetch(`${BASE_URL}/campaigns`, {
//             headers: { "x-api-key": API_KEY }
//         });
//         const campaigns = await checkRes.json();
//         const targetCampaign = campaigns.find(c => c._id === campaign._id);
//         console.log("   Final Status:", targetCampaign ? targetCampaign.status : "Not Found");
//         console.log("   Stats:", targetCampaign ? targetCampaign.stats : "N/A");

//     } catch (error) {
//         console.error("❌ Test Failed:", error);
//     }
// }

// runTest();
