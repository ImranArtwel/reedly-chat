const express = require("express");
const {
  register,
  login,
  refreshToken,
  fetchToken,
  fetchUser,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refreshToken);
// router.get("/token", fetchToken);
router.get("/user/:id", fetchUser);

module.exports = router;
