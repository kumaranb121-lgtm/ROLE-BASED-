const crypto = require('crypto');
const webpush = require('web-push');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- YOUR KEYS ---');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\nVAPID_PUBLIC_KEY:');
console.log(vapidKeys.publicKey);
console.log('\nVAPID_PRIVATE_KEY:');
console.log(vapidKeys.privateKey);
console.log('-----------------');
