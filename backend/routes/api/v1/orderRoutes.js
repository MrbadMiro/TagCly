import express from "express";
import {
  createSingleCollarOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  deleteOrder,
  updateOrder,
} from "../../../controllers/commerce/orderController.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Order routes
router
  .route("/")
  .get(authenticate, authorizeAdmin, getOrders) // Admin get all orders
  .post(authenticate, createSingleCollarOrder); // Create new order

router.route("/myorders").get(authenticate, getMyOrders); // Get logged in user orders

router.route("/single").post(authenticate, createSingleCollarOrder); // Create single collar order

router
  .route("/:id")
  .get(authenticate, getOrderById) // Get order by ID
  .put(authenticate, authorizeAdmin, updateOrder) // Admin update order
  .delete(authenticate, authorizeAdmin, deleteOrder); // Admin delete order

router.route("/:id/pay").put(authenticate, updateOrderToPaid); // Update to paid

router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, updateOrderToDelivered); // Admin update to delivered

export default router;
