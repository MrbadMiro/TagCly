import asyncHandler from "../../middlewares/asyncHandler.js";
import Order from "../../models/database/orderModel.js";
import Collar from "../../models/database/collarModel.js";
import Pet from "../../models/database/petModel.js";

// @desc    Create new single collar order
// @route   POST /api/orders/single
// @access  Private
const createSingleCollarOrder = asyncHandler(async (req, res) => {
  const { productId, variantId, paymentMethod, shippingInfo, pet } = req.body;

  // Validate all required fields
  const requiredFields = {
    productId: "Product ID",
    variantId: "Variant ID",
    paymentMethod: "Payment method",
    shippingInfo: "Shipping information",
    pet: "Pet information",
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([field]) => !req.body[field])
    .map(([_, name]) => name);

  if (missingFields.length > 0) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate shipping info
  const requiredShippingFields = {
    firstName: "First name",
    email: "Email",
    phone: "Phone",
    street: "Street address",
    city: "City",
  };

  const missingShippingFields = Object.entries(requiredShippingFields)
    .filter(([field]) => !shippingInfo[field])
    .map(([_, name]) => name);

  if (missingShippingFields.length > 0) {
    res.status(400);
    throw new Error(
      `Missing shipping info: ${missingShippingFields.join(", ")}`
    );
  }

  // Validate pet information
  if (pet.existingPet && !mongoose.Types.ObjectId.isValid(pet.existingPet)) {
    res.status(400);
    throw new Error("Invalid pet ID");
  }

  if (!pet.existingPet) {
    const requiredPetFields = {
      name: "Pet name",
      breed: "Pet breed",
      age: "Pet age",
      weight: "Pet weight",
      gender: "Pet gender",
    };

    const missingPetFields = Object.entries(requiredPetFields)
      .filter(([field]) => !pet.newPet[field])
      .map(([_, name]) => name);

    if (missingPetFields.length > 0) {
      res.status(400);
      throw new Error(
        `Missing pet information: ${missingPetFields.join(", ")}`
      );
    }
  }

  // Find collar and verify variant
  const collar = await Collar.findById(productId);
  if (!collar) {
    res.status(404);
    throw new Error("Collar not found");
  }

  const variant = collar.variants.find((v) => v._id.toString() === variantId);
  if (!variant) {
    res.status(404);
    throw new Error("Variant not found");
  }

  if (variant.stock < 1) {
    res.status(400);
    throw new Error("Selected variant is out of stock");
  }

  // Verify pet exists if using existing pet
  let petDetails = null;
  if (pet.existingPet) {
    const existingPet = await Pet.findOne({
      _id: pet.existingPet,
      owner: req.user._id,
    });

    if (!existingPet) {
      res.status(404);
      throw new Error("Pet not found or not owned by user");
    }

    petDetails = {
      existingPet: existingPet._id,
    };
  } else {
    petDetails = {
      newPet: {
        ownerId: req.user._id,
        name: pet.newPet.name,
        breed: pet.newPet.breed,
        age: pet.newPet.age,
        weight: pet.newPet.weight,
        gender: pet.newPet.gender,
        specialNeeds: pet.newPet.specialNeeds || "",
      },
    };
  }

  // Create order
  const order = new Order({
    user: req.user._id,
    products: [
      {
        productId: collar._id,
        variant: {
          _id: variant._id,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
        },
        quantity: 1,
        price: collar.basePrice,
      },
    ],
    pet: petDetails,
    shippingInfo,
    paymentMethod,
    shippingFee: 10.0,
    totalAmount: collar.basePrice + 10.0,
  });

  // Update stock
  variant.stock -= 1;

  // Save the order and update collar
  const [savedOrder] = await Promise.all([order.save(), collar.save()]);

  // If new pet was added, optionally create a pet record
  if (!pet.existingPet && req.body.savePet) {
    await Pet.create({
      ownerId: req.user._id,
      name: pet.newPet.name,
      breed: pet.newPet.breed,
      age: pet.newPet.age,
      weight: pet.newPet.weight,
      gender: pet.newPet.gender,
      specialNeeds: pet.newPet.specialNeeds || "",
      collarAssigned: true,
      collarOrder: savedOrder._id,
    });
  }

  res.status(201).json({
    _id: savedOrder._id,
    orderStatus: savedOrder.orderStatus,
    paymentStatus: savedOrder.paymentStatus,
    totalAmount: savedOrder.totalAmount,
    pet: savedOrder.pet,
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name email")
    .populate("products.productId", "modelName image");
  res.status(200).json(orders);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "products.productId",
    "modelName image"
  );
  res.status(200).json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("products.productId", "modelName image");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Verify ownership or admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error("Not authorized");
  }

  res.status(200).json(order);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Verify ownership
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error("Not authorized");
  }

  order.paymentStatus = "completed";
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.email_address,
  };

  const updatedOrder = await order.save();
  res.status(200).json(updatedOrder);
});

// @desc    Update order to delivered (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = "delivered";
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json(updatedOrder);
});

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Restore product stock if order is being deleted
  if (order.orderStatus !== "cancelled") {
    for (const item of order.products) {
      const collar = await Collar.findById(item.productId);
      if (collar) {
        const variant = collar.variants.id(item.variant._id);
        if (variant) {
          variant.stock += item.quantity;
          await collar.save();
        }
      }
    }
  }

  // Use deleteOne() instead of remove()
  await Order.deleteOne({ _id: order._id });

  res.status(200).json({ message: "Order deleted successfully" });
});

// @desc    Update order (Admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, shippingInfo } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (shippingInfo) order.shippingInfo = shippingInfo;

  const updatedOrder = await order.save();
  res.status(200).json(updatedOrder);
});

export {
  createSingleCollarOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  deleteOrder, // Add this
  updateOrder, // Add this
};
