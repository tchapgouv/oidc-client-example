import assert from "assert";

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const appUrl: string = process.env.APP_URL ? process.env.APP_URL.replace(/\/+$/, '') : `http://localhost:${port}`;

assert(process.env.PROVIDER_URL, 'Missing PROVIDER_URL env var')
assert(process.env.CLIENT_SECRET,'Missing CLIENT_SECRET env var')
assert(process.env.CLIENT_ID,'Missing CLIENT_ID env var')

export {
    port, appUrl
}
