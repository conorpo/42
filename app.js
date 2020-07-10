const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const verify = require('./util/verify.js');
const orderHandler = require('./handlers/orders.js');

//So that we can soo the log.txt file
app.use(express.static('public'));

//Stores the body as a buffer in req.rawBody (for use in validation)
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

//Default unauthorized page
app.get('*',(req,res)=>{
    res.status(400).send("You shouldn't be here..")
});

//Verifys that post requests are coming from shopify.
app.post('*',(req,res, next) => {
    const rawData = req.rawBody;
    const given_hmac = req.header('x-shopify-hmac-sha256');
    if(!verify(rawData, given_hmac)) return res.status(403).send("Webhook Denied");
    console.log("Received Valid Webhook");
    next();
})


//Handles orders
app.post('/api/order', orderHandler); //founds in handlers/order.js

module.exports = app;