import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller";

const router = express.Router();


// http://localhost:5000/api/coupons/
router.get('/', protectRoute, getCoupon);

// http://localhost:5000/api/coupons/validate
router.post('/', protectRoute, validateCoupon);

export default router;