const express = require("express");
const taskController = require("../controller/taskController");
const upload = require("../common/uploadFile");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post(
  "/create",
  upload.single("task_attachment"),
  authMiddleware.authenticateToken,
  taskController.createTask
);
router.get(
  "/list",
  authMiddleware.authenticateToken,
  taskController.getAllTask
);
router.put(
  "/update/:id",
  authMiddleware.authenticateToken,
  upload.single("task_attachment"),
  taskController.updateTask
);
router.delete(
  "/delete/:id",
  authMiddleware.authenticateToken,
  taskController.deleteTask
);
module.exports = router;
