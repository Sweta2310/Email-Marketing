// import fetch from "node-fetch";

// const BASE_URL = "http://localhost:8000/api/auth";

// async function testAuth() {
//     console.log("Testing Auth Endpoints...");

//     const email = `test_debug_${Date.now()}@test.com`;
//     const password = "password123";

//     // 1. Signup
//     try {
//         console.log(`\nAttempting Signup with ${email}...`);
//         const res = await fetch(`${BASE_URL}/signup`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ name: "Debug User", email, password })
//         });

//         const text = await res.text();
//         console.log("Status:", res.status);
//         console.log("Response:", text);

//         if (res.status !== 201) return;

//         // 2. Login
//         console.log(`\nAttempting Login...`);
//         const loginRes = await fetch(`${BASE_URL}/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password })
//         });
//         const loginText = await loginRes.text();
//         console.log("Login Status:", loginRes.status);
//         console.log("Login Response:", loginText);

//     } catch (error) {
//         console.error("Fetch Error:", error);
//     }
// }

// testAuth();
