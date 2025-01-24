import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller";

const router = express.Router();

// http://localhost:5000/api/payments/create-checkout-session
router.post('/create-checkout-session', protectRoute,createCheckoutSession);

// http://localhost:5000/api/payments/checkout-success
router.post('/checkout-success', protectRoute, checkoutSuccess);

export default router;