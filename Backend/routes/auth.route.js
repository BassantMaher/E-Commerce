import express from "express";

const router = express.Router();

import { Signup, Login, Logout } from "../controllers/auth.controller.js";

// http://localhost:5000/api/auth/signup
router.post("/signup", Signup);

// http://localhost:5000/api/auth/login
router.post("/login", Login);

// http://localhost:5000/api/auth/logout
router.post("/logout", Logout);

export default router;