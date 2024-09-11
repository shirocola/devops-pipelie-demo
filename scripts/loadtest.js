import http from 'k6/http';
import { check, sleep } from 'k6';

// Define the test stages
export let options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up to 50 users over 30 seconds
    { duration: '1m', target: 100 },   // Maintain 100 users for 1 minute
    { duration: '10s', target: 0 },    // Ramp-down to 0 users in 10 seconds
  ],
};

export default function () {
  let res = http.get('http://localhost:3000/products');  // Your API endpoint here

  // Check if the response status is 200
  check(res, {
    'status was 200': (r) => r.status === 200,
  });

  // Simulate a short break between requests
  sleep(1);
}
