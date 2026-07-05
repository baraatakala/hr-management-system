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

async function main() {
  // Get all tables
  const tbls = ['employees','companies','departments','jobs','nationalities','activity_log','email_reminders','sent_reminders'];
  for (const t of tbls) {
    const r = await get(`/rest/v1/${t}?select=*&limit=1`);
    if (Array.isArray(r) && r.length > 0) {
      console.log(`\n=== ${t} columns ===`);
      console.log(Object.keys(r[0]).join(', '));
    } else {
      console.log(`\n=== ${t} (empty or error) ===`);
      console.log(JSON.stringify(r).substring(0, 200));
    }
  }
}

main().catch(console.error);
