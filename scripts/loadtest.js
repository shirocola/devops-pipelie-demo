import http from 'k6/http';
import { check, sleep } from 'k6';

// Define the load stages
export let options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 users
    { duration: '1m', target: 100 },  // Maintain 100 users for 1 minute
    { duration: '10s', target: 0 },   // Ramp-down to 0 users
  ],
};

const BASE_URL = 'http://backend:3000';  // Use Docker service name for backend

export default function () {
  // 1. Get all products
  let res = http.get(`${BASE_URL}/products`);
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Get product by ID (assuming an ID exists, replace 1 with valid ID)
  res = http.get(`${BASE_URL}/products/1`);
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);

  // 3. Create a new product (example POST request)
  const payload = JSON.stringify({
    name: `New Product ${Math.random()}`,
    price: Math.floor(Math.random() * 100),
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  res = http.post(`${BASE_URL}/products`, payload, params);
  check(res, { 'status was 201': (r) => r.status === 201 });  // Check for Created response
  sleep(1);

  // 4. Get users (if you have a user API)
  res = http.get(`${BASE_URL}/users`);
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);

  // 5. Get orders (if you have an order API)
  res = http.get(`${BASE_URL}/orders`);
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
