// const express = require("express");
import express from "express"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

//routes
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse the request body
app.use(cookieParser()); 

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log("server listening on http://localhost:" + PORT);
    connectDB();
});