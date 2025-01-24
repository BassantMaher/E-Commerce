// const express = require("express");
import express from "express"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

//routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupons.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse the request body
app.use(cookieParser()); 

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
    console.log("server listening on http://localhost:" + PORT);
    connectDB();
});