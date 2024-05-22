const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express()
const port = process.env.PORT || 3000


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.post('/payment-sheet', async (req, res) => {
   // Use an existing Customer ID if this is a returning customer.
   const customer = await stripe.customers.create();
   const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-04-10' }
   );
   const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: 'eur',
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
         enabled: true,
      },
   });

   res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
   });
});


app.listen(port, () => {
   console.log('App is listening on Port : ' + port)
   console.log(process.env.STRIPE_SECRET_KEY)
})




