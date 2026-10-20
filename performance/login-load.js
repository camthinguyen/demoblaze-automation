import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'https://api.demoblaze.com';
const USERNAME = __ENV.TEST_USERNAME;
const PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  stages: [
    { duration: '1m', target: 25 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  if (!USERNAME || !PASSWORD) {
    throw new Error('Set TEST_USERNAME and TEST_PASSWORD before running.');
  }

  const response = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'login' },
    }
  );

  check(response, {
    'login HTTP status is 200': (r) => r.status === 200,
    'login response is not empty': (r) => r.body.length > 0,
  });
}