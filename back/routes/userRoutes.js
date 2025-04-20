import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/UserController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// router.put("/update-profile", updateProfile);

export default router;
