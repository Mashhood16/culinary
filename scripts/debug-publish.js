const base = 'http://localhost:3004';

async function main() {
  const loginRes = await fetch(base + '/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@globalrecipehub.com', password: 'admin123' }),
    credentials: 'include',
  });
  console.log('login status', loginRes.status);
  console.log('login body', await loginRes.text());
  const setCookie = loginRes.headers.get('set-cookie') || '';
  console.log('set-cookie', setCookie);

  const bulkRes = await fetch(base + '/api/admin/recipes/bulk-actions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: setCookie },
    body: JSON.stringify({ action: 'publish-all' }),
    credentials: 'include',
  });
  console.log('bulk status', bulkRes.status);
  console.log('bulk body', await bulkRes.text());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
