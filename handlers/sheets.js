const OrderModel = require('../models/Order.js');
const crypto = require('crypto');
const fs = require('fs');
const fetch = require('node-fetch');

async function sheetsHandler(req, res) {
    if (!req.order){
        fs.appendFile('./public/log.txt',`\n${(new Date())} --- Sheet handler did not have order object\n`, () => {}) //logs out errors at site/log.txt
        return;
    } 

    const postData = JSON.stringify(req.order);

    const generatedHmac = crypto.createHmac("sha256", process.env.sheets_secret).update(Buffer.from(postData, 'utf-8')).digest("hex");
     
    console.log("Sending order");
    const response = await fetch(process.env.sheets_url + "?hmac=" + generatedHmac + "&type=" + req.webhookType, {
        method: 'post',
        body: postData,
    });
    const text = await response.text();
    console.log(text);
    return;
}

module.exports = sheetsHandler;