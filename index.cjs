const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
   origin: '*', // allows all domains and origin to use this api
}))

app.post('/payment-sheet', async (req, res) => {
   try {
      const { amount, customerID } = req.body
      // Use an existing Customer ID if this is a returning customer.
      const customer = customerID
      const ephemeralKey = await stripe.ephemeralKeys.create(
         { customer: customer },
         { apiVersion: '2024-04-10' }
      );
      const paymentIntent = await stripe.paymentIntents.create({
         amount: amount,
         currency: 'pkr',
         customer: customer,
         // In the latest version of the API, specifying the `automatic_payment_methods` parameter
         // is optional because Stripe enables its functionality by default.
         automatic_payment_methods: {
            enabled: true,
         },
      });

      res.json({
         paymentIntent: paymentIntent.client_secret,
         ephemeralKey: ephemeralKey.secret,
         customer: customer,
         publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      });
   } catch (error) {
      res.status(500).json({
         'Error': error,
      })
   }
});

app.get('/', (req, res) => {
   res.status(200).json({
      "msg": "SERVER IS UP"
   })
})

app.listen(port, () => {
   console.log('Listening on PORT : ' + port)
})




