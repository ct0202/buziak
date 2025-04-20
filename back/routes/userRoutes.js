const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

// router.put("/update-profile", userController.updateProfile);

module.exports = router;
