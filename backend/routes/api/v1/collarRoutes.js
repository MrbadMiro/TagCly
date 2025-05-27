import express from "express";
import {
  addCollar,
  updateCollarDetails,
  removeCollar,
  fetchAllCollars,
  fetchCollarById,
  updateVariantStock,
} from "../../../controllers/devices/collarController.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authMiddleware.js";
import upload from "../../../middlewares/multer.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", fetchAllCollars);
router.get("/:id", fetchCollarById);

// Admin protected routes
router.use(authenticate, authorizeAdmin);

router.post("/", upload.single("image"), addCollar);

router.put("/:id", upload.single("image"), updateCollarDetails);

router.delete("/:id", removeCollar);

// Variant specific route
router.patch("/variant/:variantId/stock", updateVariantStock);

export default router;
