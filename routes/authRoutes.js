const express = require("express");
const {
  signup,
  login,
  createExcelSheet,
  createPdf,
} = require("../controller/authController");
const upload = require("../common/uploadFile");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.post("/signup", upload.single("profile_img"), signup);
router.post("/login", login);
router.get("/excelsheet-all-users", createExcelSheet);
router.get("/user-pdf", authenticateToken, createPdf);

module.exports = router;
