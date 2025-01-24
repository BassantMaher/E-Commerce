import express from "express";

const router = express.Router();

import { Signup, Login, Logout, refreshToken } from "../controllers/auth.controller.js";

// http://localhost:5000/api/auth/signup
router.post("/signup", Signup);

// http://localhost:5000/api/auth/login
router.post("/login", Login);

// http://localhost:5000/api/auth/logout
router.post("/logout", Logout);

// http://localhost:5000/api/auth/refresh-token
router.post("/refresh-token", refreshToken);

// http://localhost:5000/api/auth/profile
// router.post("/profile", getProfile) 

export default router;