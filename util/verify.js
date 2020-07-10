const crypto = require('crypto');


const verifyWebhook = (data, hmac_header) => {
    const hmac = crypto.createHmac('sha256',process.env.shopify_secret);
    hmac.update(data);
    const computed_hmac = hmac.digest('base64');
    return crypto.timingSafeEqual(Buffer.from(computed_hmac), Buffer.from(hmac_header));
}

module.exports = verifyWebhook;