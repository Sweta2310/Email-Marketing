import dns from "dns";
const { resolveMx } = dns.promises;

export const validateEmail = (email) => {
    if (!email) return false;
    const trimmedEmail = String(email).trim().toLowerCase();
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = re.test(trimmedEmail);
    // console.log(`[Validation] Checking format: "${email}" -> Valid: ${isValid}`);
    return isValid;
};

export const isValidDomain = async (email) => {
    try {
        const domain = String(email).split("@")[1];
        if (!domain) return false;

        // console.log(`[DomainCheck] Resolving MX for: ${domain}`);
        const mxRecords = await resolveMx(domain);

        // Filter out null MX (RFC 7505) and empty exchanges
        const validMx = mxRecords && mxRecords.filter(mx => mx.exchange && mx.exchange !== "" && mx.exchange !== ".");

        const hasValidMx = validMx && validMx.length > 0;
        // console.log(`[DomainCheck] Result for ${domain}: ${hasValidMx ? "Valid MX found" : "No valid MX"}`);
        return hasValidMx;
    } catch (error) {
        // console.warn(`[DomainCheck] Error/No records for ${email}:`, error.code || error.message);
        return false;
    }
};
