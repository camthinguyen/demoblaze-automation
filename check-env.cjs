const dotenv = require('dotenv');
const path = require('node:path');

const envPath = path.resolve(__dirname, 'test-data.env');
const result = dotenv.config({ path: envPath });

console.log('File path:', envPath);
console.log('Dotenv error:', result.error?.message ?? 'None');
console.log('Parsed keys:', Object.keys(result.parsed ?? {}));
console.log('Username loaded:', Boolean(process.env.TEST_USERNAME));