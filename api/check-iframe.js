const https = require('https');

function checkHeaders(domain) {
  https.get(`https://${domain}`, (res) => {
    console.log(`\n--- ${domain} ---`);
    console.log('x-frame-options:', res.headers['x-frame-options']);
    console.log('content-security-policy:', res.headers['content-security-policy']);
  }).on('error', (e) => {
    console.error(e);
  });
}

checkHeaders('meet.jit.si');
checkHeaders('meet.ffmuc.net');
checkHeaders('jitsi.riot.im');
checkHeaders('meet.element.io');
