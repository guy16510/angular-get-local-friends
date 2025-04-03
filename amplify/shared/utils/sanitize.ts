export function sanitizeBigInts(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'bigint') {
        // Convert BigInt to Number if it's within safe integer range
        const num = Number(obj);
        if (Number.isSafeInteger(num)) {
            return num;
        }
        // For values outside safe integer range, convert to string
        return obj.toString();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(sanitizeBigInts);
    }
    
    if (typeof obj === 'object') {
        const sanitized: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitized[key] = sanitizeBigInts(obj[key]);
            }
        }
        return sanitized;
    }
    
    return obj;
}