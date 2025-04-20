import express from "express";
import userController from "../controllers/UserController.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

// router.put("/update-profile", userController.updateProfile);

export default router;
