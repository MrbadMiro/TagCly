import asyncHandler from "../../middlewares/asyncHandler.js";
import Collar from "../../models/database/collarModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// 1. Add New Collar with Variants
const addCollar = asyncHandler(async (req, res) => {
  try {
    const { modelName, basePrice, variants, description, status } = req.body;

    // Validate required fields
    if (!modelName || !basePrice) {
      return res.status(400).json({
        success: false,
        error: "Required fields are missing",
        requiredFields: ["modelName", "basePrice"],
      });
    }

    // Handle single image upload
    let imageUrl = "";
    if (req.file) {
      try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "dog_collars",
          resource_type: "image",
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({
          success: false,
          error: "Image upload failed",
          details: uploadError.message,
        });
      }
    }

    // Process variants with SKU generation
    const processedVariants = Array.isArray(variants)
      ? variants.map((variant) => ({
          variantId: uuidv4(),
          color: variant.color || "",
          size: variant.size || "",
          stock: Number(variant.stock) || 0,
          sku: `${modelName}-${variant.color}-${variant.size}`
            .toUpperCase()
            .replace(/\s+/g, "-"),
        }))
      : [];

    // Create collar
    const collar = new Collar({
      modelName,
      basePrice: Number(basePrice),
      variants: processedVariants,
      image: imageUrl,
      description: description || "",
      status: status || "available",
    });

    // Save collar
    const savedCollar = await collar.save();

    res.status(201).json({
      success: true,
      message: "Collar added successfully",
      data: savedCollar,
    });
  } catch (error) {
    console.error("Add Collar Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

// 2. Update Collar Details
const updateCollarDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the collar
    const collar = await Collar.findById(id);
    if (!collar) {
      return res.status(404).json({
        success: false,
        error: "Collar not found",
      });
    }

    // Update image if new image is uploaded
    if (req.files && req.files.mainImage) {
      try {
        const mainImageResult = await cloudinary.uploader.upload(
          req.files.mainImage[0].path,
          {
            folder: "dog_collars/main",
            resource_type: "auto",
          }
        );
        updateData.image = mainImageResult.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          error: "Image upload failed",
          details: uploadError.message,
        });
      }
    }

    // Merge and save updates
    Object.keys(updateData).forEach((key) => {
      if (key !== "variants") {
        collar[key] = updateData[key];
      }
    });

    // Handle variants update
    if (updateData.variants) {
      collar.variants = updateData.variants.map((variant) => ({
        variantId:
          variant.variantId || new mongoose.Types.ObjectId().toString(),
        color: variant.color || "",
        size: variant.size || "",
        sku: variant.sku || new mongoose.Types.ObjectId().toString(),
        stock: Number(variant.stock) || 0,
      }));
    }

    const updatedCollar = await collar.save();

    res.json({
      success: true,
      message: "Collar updated successfully",
      data: updatedCollar,
    });
  } catch (error) {
    console.error("Update Collar Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update collar",
      details: error.message,
    });
  }
});

// 3. Remove a Collar
const removeCollar = asyncHandler(async (req, res) => {
  try {
    const collar = await Collar.findByIdAndDelete(req.params.id);
    if (!collar) {
      return res.status(404).json({
        success: false,
        error: "Collar not found",
      });
    }

    // Optional: Cloudinary image cleanup
    if (collar.image) {
      try {
        await cloudinary.uploader.destroy(
          collar.image.split("/").pop().split(".")[0]
        );
      } catch (error) {
        console.error("Image deletion error:", error);
      }
    }

    res.json({
      success: true,
      message: "Collar removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Failed to remove collar",
      details: error.message,
    });
  }
});

// 4. Fetch All Collars with Filtering
const fetchAllCollars = asyncHandler(async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
    } = req.query;

    const query = {};

    // Status filter
    if (status) query.status = status;

    // Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { modelName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "variants.color": { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      sort: { createdAt: -1 },
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    };

    const [collars, total] = await Promise.all([
      Collar.find(query, null, options),
      Collar.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: collars.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: collars,
    });
  } catch (error) {
    console.error("Fetch Collars Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
});

// 5. Fetch Collar by ID
const fetchCollarById = asyncHandler(async (req, res) => {
  try {
    const collar = await Collar.findById(req.params.id);

    if (!collar) {
      return res.status(404).json({
        success: false,
        error: "Collar not found",
      });
    }

    res.json({
      success: true,
      data: collar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch collar",
      details: error.message,
    });
  }
});

// 6. Update Variant Stock
const updateVariantStock = asyncHandler(async (req, res) => {
  try {
    const { stock } = req.body;
    const { variantId } = req.params;

    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({
        success: false,
        error: "Valid stock value is required",
      });
    }

    const collar = await Collar.findOneAndUpdate(
      { "variants.variantId": variantId },
      { $set: { "variants.$.stock": Number(stock) } },
      { new: true }
    );

    if (!collar) {
      return res.status(404).json({
        success: false,
        error: "Variant not found",
      });
    }

    const updatedVariant = collar.variants.find(
      (v) => v.variantId === variantId
    );

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: updatedVariant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Failed to update stock",
      details: error.message,
    });
  }
});

export {
  addCollar,
  updateCollarDetails,
  removeCollar,
  fetchAllCollars,
  fetchCollarById,
  updateVariantStock,
};
