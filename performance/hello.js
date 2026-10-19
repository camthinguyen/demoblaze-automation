import { check } from 'k6';

export default function () {
  console.log('Hello from k6!');

  check(200, {
    'status is 200': (status) => status === 200,
  });
}