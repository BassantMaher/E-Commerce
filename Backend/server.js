// const express = require("express");
import express from "express"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

//routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/products.route.js";
import cartRoutes from "./routes/cart.route.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse the request body
app.use(cookieParser()); 

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);


app.listen(PORT, () => {
    console.log("server listening on http://localhost:" + PORT);
    connectDB();
});