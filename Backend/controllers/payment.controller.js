import Coupon from "../models/coupon.model.js";
import stripe from "../lib/stripe.js";

export const createCheckoutSession = async (req, res, next) => {
    try {
        // first get the products and the coupon code
        // check if the products array is empty, if empty then no checkout session will be done --> error
        // if there are products, we should calculate the total amount to be paid  by looping to the products array and then adding the amount with the quantity
        // amount in stripe is calculated in cents so we multiply by 100
        // return an object with the product (for each product) { currency, product data :{ name and image},unit amount} --> nedded by stripe
        // check for the coupon and verify it ( look for it in the user database and check if it is active)
        // if its active, add discount to the total amount --> in the format of cents
        const { products, couponCode } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "invalid or empty products array" });
        }
        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100);
            totalAmount += (amount * product.quantity);

            return {
                price_data: {
                    currency: "AED",
                    product_data: {
                        name: product.name,
                        image: [product.image], // in a form of an array
                    },
                    unit_amount: amount
                }
            }
        });
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }
        // step 2:
        // create a session with stripe, in the format that stripe needs
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                    {
                        coupon: await createStripeCoupon(coupon.discountPercentage),
                    },
                ]
                : [],
                // metadata is used with other apis, to get the order and the user and the coupon
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p.id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                )
            }
        });
        // create a coupon in the database --> if the user buys with an amount of 200 dollars and more to get 10 % discount for the next purchase (not now)
        if (totalAmount > 20000) {
            await createNewCoupon(req.user._id);
        }
        // return the session id and the total amount to the frontend
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.log("error in the createCheckoutSession controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        // get the session from the client, check the session and check if the payment has been created, then check for the coupon code and delete it because its used once
        const sessionId = req.body;
        const session = await stripe.checkout.session.retrieve(sessionId);

        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId,
                }, {
                    isActive: false,
                })
            }
            // payment is done, so create an order with it and save it in the database
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.user,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price,
                })),
                totalAmount: session.amount_total / 100, // to return it in dollars
                stripeSessionId: sessionId
            });
            await newOrder.save();
            return res.status(200).json({
                success: true,
                message: "payment successful, order created, and coupon deactivated if used",
                orderId: newOrder._id,
            });
        }
    } catch (error) {
        console.log("error in the checkoutSuccess controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// a function that returns the id of stripe coupon for stripe to use it
async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}
// create a new random coupon special for the user
async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // expires in 30 days from now
        userId: userId,
    });
    await newCoupon.save();
}