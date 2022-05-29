const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51Jw3v5HGCqyVSIesRbq49QSO4eBhn4VIvYgwIR4Yb7MOzL1eN5AIKdnx7SM2J6Hj7E0CPlfHsyTEPf138vwAhdSN00cETaUycb"
);

const port = 3001;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/pay", async (req, res) => {
  console.log(req.body);
  const { email, price } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price,
    currency: "usd",
    // Verify your integration in this guide by including this parameter
    metadata: { integration_check: "accept_a_payment" },
    receipt_email: email,
  });

  res.json({ client_secret: paymentIntent["client_secret"] });
});

app.post("/sub", async (req, res) => {
  const { email, payment_method } = req.body;
  console.log(payment_method);

  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: "price_1Kp861HGCqyVSIes5rkE5eza" }],
    expand: ["latest_invoice.payment_intent"],
  });

  const status = subscription["latest_invoice"]["payment_intent"]["status"];
  const client_secret =
    subscription["latest_invoice"]["payment_intent"]["client_secret"];

  res.json({ subscription });
});

app.post("/cancel", async (req, res) => {
  // const subs = await  stripe.subscriptions.del("sub_1KqeN5HGCqyVSIeslugRP5lP");
  const subs = await stripe.subscriptions.update(
    "sub_1Kqa6sHGCqyVSIes1CwIwFib",
    {
      cancel_at_period_end: false,
    }
  );
  res.send({ subs });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.post("/d", async (req, res) => {
  const subscription = await stripe.subscriptions.retrieve(
    "sub_1KqbkyHGCqyVSIesv0x6iNQS"
  );
  res.send({ subscription });
});

app.post("/updateSub", async (req, res) => {
  const subscription = await stripe.subscriptions.retrieve(
    "sub_1Kqa41HGCqyVSIesUH0MrrqA"
  );

  const subscriptionUpdated = await stripe.subscriptions.update(
    subscription.id,
    {
      payment_behavior: "pending_if_incomplete",
      proration_behavior: "always_invoice",
      items: [
        {
          id: subscription.items.data[0].id,
          price: "price_1KpOhaHGCqyVSIesY6CYTtCq",
        },
      ],
    }
  );
  res.send({ subscriptionUpdated });
});
