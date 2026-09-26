import webpush from 'web-push';
try {
  webpush.setVapidDetails(
    'mailto:test@test.com',
    'BOnFhN18sTDzKLDHD2TAoC8wkOwxSctkFicB6loj1HeanDypSanApb6bbtgf_5ep1ePOafFIpgwqHhgbcmANfqw',
    '58bFTgs25qqYoB9xtGyimIBuu0Ffp62YuxAQ2gvtudk'
  );
  console.log('Success!');
} catch(e) {
  console.error(e.message);
}
