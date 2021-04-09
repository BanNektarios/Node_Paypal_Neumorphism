var express = require('express');
var router = express.Router();
const paypal = require('paypal-rest-sdk');


paypal.configure({
  'mode': 'sandbox',
  'client_id': 'AUeuOhJDawn5hZNOdpVcjv1t4n3sG1vUCu9kq-SOUzQxTlwNPPib4P8NdHz9Z4MXa4yrBnpiqDgdRWiT',
  'client_secret': 'EM1JRw8mhbTJRa7MDXu9wWBtjT_mRGXVwjZrxv_auXdB9oGytxqIsUY2rSQGbjyqGE6vk346dkaXCCqb',
})


router.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Red Sox Hat",
          "sku": "1",
          "price": "25.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "25.00"
      },
      "description": "This is a sports team hat."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href)
        }
      }
    }
  });

});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "amount": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => { 
    if (error) {
      console.log(error.response)
      throw error;
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment))
      res.send('SUCCESS');
    }
  })
});

router.get('/cancel', (req,res)=>  res.send("CANCELLED"))

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
