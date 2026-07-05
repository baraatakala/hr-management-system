const https = require('https');

const BASE = 'lydqwukaryqghovxbcqg.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZHF3dWthcnlxZ2hvdnhiY3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4OTI4MSwiZXhwIjoyMDY3NjY1MjgxfQ.CQiqU_StpnAgvYDdcgdsfk9hn9-AkCXyiDsWP13UTgA';

function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE,
      path,
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    };
    https.get(options, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: BASE,
      path,
      method: 'POST',
      headers: { 
        apikey: KEY, 
        Authorization: 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Get reminders table schema
  const r1 = await get('/rest/v1/reminders?select=*&limit=1');
  console.log('\n=== reminders columns ===');
  if (Array.isArray(r1) && r1.length > 0) {
    console.log(Object.keys(r1[0]).join(', '));
    console.log('Sample:', JSON.stringify(r1[0]).substring(0, 300));
  } else {
    console.log(JSON.stringify(r1).substring(0, 300));
  }

  // Get all employees count
  const r2 = await get('/rest/v1/employees?select=id');
  console.log('\n=== Total employees:', Array.isArray(r2) ? r2.length : 'err', '===');

  // Check for triggers via management API
  console.log('\n=== Checking storage buckets ===');
  const r3 = await get('/storage/v1/bucket');
  console.log(JSON.stringify(r3).substring(0, 500));

  // Check activity_log count
  const r4 = await get('/rest/v1/activity_log?select=id');
  console.log('\n=== Total activity_log records:', Array.isArray(r4) ? r4.length : 'err', '===');
}

main().catch(console.error);
