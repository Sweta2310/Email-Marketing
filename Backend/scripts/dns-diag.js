import dns from "dns";
const { resolveMx, resolveA } = dns.promises;

async function checkDomain(domain) {
    // console.log(`\n--- Checking: ${domain} ---`);
    try {
        const mx = await resolveMx(domain);
        // console.log(`MX Records:`, JSON.stringify(mx, null, 2));
    } catch (err) {
        // console.log(`MX Error: ${err.code}`);
    }

    try {
        const a = await resolveA(domain);
        // console.log(`A Records:`, JSON.stringify(a, null, 2));
    } catch (err) {
        // console.log(`A Error: ${err.code}`);
    }
}

async function run() {
    await checkDomain("example.com");
    await checkDomain("gmail.com");
    await checkDomain("nonexistent-domain-xyz-123.com");
    await checkDomain("test.con");
}

run();
