const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const outDir = __dirname;

function runTest(query, filename) {
  return new Promise((resolve) => {
    console.log(`\n=== ${query} ===`);
    const startTime = Date.now();
    const postData = JSON.stringify({ content: query, aspect_ratio: '16:9', language: 'en' });
    
    const req = http.request({
      hostname: 'localhost', port: 4777, path: '/api/generate',
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        const fullBuffer = Buffer.concat(chunks).toString();
        
        // Find base64 image
        const imgMatch = fullBuffer.match(/data:image\/png;base64,([A-Za-z0-9+\/=]+)/);
        if (imgMatch) {
          const outPath = path.join(outDir, filename);
          fs.writeFileSync(outPath, Buffer.from(imgMatch[1], 'base64'));
          const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
          console.log(`  Image: ${filename} (${kb}KB) in ${((Date.now()-startTime)/1000).toFixed(1)}s`);
          
          const credMatch = fullBuffer.match(/"credibility":\{"overall":(\d+),"breakdown":\{"sourceCount":(\d+),"crossVerified":(\d+),"recency":(\d+),"authority":(\d+)\},"claimsTotal":(\d+),"claimsCrossVerified":(\d+)\}/);
          if (credMatch) {
            console.log(`  Credibility: ${credMatch[1]}/100 | ${credMatch[7]}/${credMatch[6]} cross-verified`);
            console.log(`  auth=${credMatch[5]} rec=${credMatch[4]} src=${credMatch[2]} xver=${credMatch[3]}`);
          }
          resolve(outPath);
        } else {
          const errMatch = fullBuffer.match(/"error":"([^"]+)"/);
          console.log(errMatch ? `  Error: ${errMatch[1]}` : `  No image (${fullBuffer.length} bytes)`);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => { console.error(`  Err: ${e.message}`); resolve(null); });
    req.write(postData);
    req.end();
  });
}

async function main() {
  const paths = [];
  for (const [q, f] of [
    ['Top 10 oil producing countries in the world', 'oil-producers.png'],
    ['Top 5 largest economies by GDP in 2025', 'gdp-economies.png'],
    ['Top 10 coffee producing countries', 'coffee-producers.png'],
  ]) {
    const p = await runTest(q, f);
    if (p) paths.push(p);
  }
  console.log(`\n=== ${paths.length}/3 images generated ===`);
  for (const p of paths) exec(`start "" "${p}"`);
}
main();
