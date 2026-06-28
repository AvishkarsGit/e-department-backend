export const requireEnv = (key:string) => {
    const value = process.env[key];
    if (value === undefined || value === '') {
        throw new Error(`Value missing in env file:${value}`);
    }
    return value;
}

export const requireIntEnv = (key: string) => {
    const parsed = parseInt(requireEnv(key),10);
    if (isNaN(parsed)) {
        throw new Error(`Value is not a number ${parsed}`);
    }
    return parsed;
}