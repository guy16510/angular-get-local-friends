export function sanitizeBigInts(obj: any): any {
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeBigInts);
    if (typeof obj === 'object' && obj !== null) {
        const sanitized: Record<string, any> = {};
        for (const key in obj) {
            sanitized[key] = sanitizeBigInts(obj[key]);
        }
        return sanitized;
    }
    return obj;
}