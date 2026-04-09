const fetch = require('node-fetch');

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'navabhi51852@gmail.com', password: 'password' }) // Assume typical pass or we can bypass
  });
  console.log('Login Status:', loginRes.status);
  const result = await loginRes.text();
  console.log(result);
}

test();
