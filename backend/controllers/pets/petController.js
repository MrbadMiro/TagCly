import asyncHandler from "../../middlewares/asyncHandler.js";
import Pet from "../../models/database/petModel.js";
import User from "../../models/database/userModel.js";
import Collar from "../../models/database/collarModel.js";
import mongoose from "mongoose";

// ✅ 1️⃣ Register a New Pet
const registerPet = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      age,
      weight,
      gender,
      ownerId,
      collarId,
      healthConditions,
      medications,
      vaccinations,
      activityLevel,
      trainingStatus,
      profileImage,
    } = req.body;

    // Validation
    if (!name || !species || !breed || !age || !weight || !gender || !ownerId) {
      return res.status(400).json({
        success: false,
        error: "Missing required pet details",
      });
    }

    // Check if owner exists
    const ownerExists = await User.findById(ownerId);
    if (!ownerExists) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    // Check if collar exists and is available (if provided)
    if (collarId) {
      const collarExists = await Collar.findById(collarId);
      if (!collarExists) {
        return res.status(404).json({
          success: false,
          error: "Collar not found",
        });
      }
      if (collarExists.isAssigned) {
        return res.status(400).json({
          success: false,
          error: "Collar is already assigned to another pet",
        });
      }
    }

    // Create new pet
    const pet = new Pet({
      name,
      species,
      breed,
      age,
      weight,
      gender,
      ownerId,
      collarId: collarId || null,
      healthConditions: healthConditions || [],
      medications: medications || [],
      vaccinations: vaccinations || [],
      activityLevel: activityLevel || "moderate",
      trainingStatus: trainingStatus || "untrained",
      profileImage: profileImage || "",
    });

    await pet.save();

    // If collar was assigned, update its status
    if (collarId) {
      await Collar.findByIdAndUpdate(collarId, {
        isAssigned: true,
        petId: pet._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Pet registered successfully",
      data: pet,
    });
  } catch (error) {
    console.error("Error registering pet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to register pet",
    });
  }
});

// ✅ 2️⃣ Get Pet Details by ID
const getPetDetails = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid pet ID format",
      });
    }

    const pet = await Pet.findById(req.params.id)
      .populate("ownerId", "username email firstName lastName")
      .populate("collarId", "deviceId isActive");

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: "Pet not found",
      });
    }

    res.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error("Error getting pet details:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve pet details",
    });
  }
});

// ✅ 3️⃣ Update Pet Details
const updatePetDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid pet ID format",
    });
  }

  try {
    // Check if pet exists
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        error: "Pet not found",
      });
    }

    // Handle collar assignment changes
    if (req.body.collarId && req.body.collarId !== pet.collarId?.toString()) {
      const newCollar = await Collar.findById(req.body.collarId);
      if (!newCollar) {
        return res.status(404).json({
          success: false,
          error: "New collar not found",
        });
      }
      if (newCollar.isAssigned) {
        return res.status(400).json({
          success: false,
          error: "Collar is already assigned to another pet",
        });
      }

      // Unassign old collar if exists
      if (pet.collarId) {
        await Collar.findByIdAndUpdate(pet.collarId, {
          isAssigned: false,
          petId: null,
        });
      }

      // Assign new collar
      await Collar.findByIdAndUpdate(req.body.collarId, {
        isAssigned: true,
        petId: id,
      });
    }

    // Update pet details
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("ownerId", "username email")
      .populate("collarId");

    res.json({
      success: true,
      message: "Pet updated successfully",
      data: updatedPet,
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update pet",
    });
  }
});

// ✅ 4️⃣ Delete a Pet
const deletePet = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid pet ID format",
      });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        error: "Pet not found",
      });
    }

    // Unassign collar if exists
    if (pet.collarId) {
      await Collar.findByIdAndUpdate(pet.collarId, {
        isAssigned: false,
        petId: null,
      });
    }

    // Soft delete the pet
    pet.isActive = false;
    await pet.save();

    res.json({
      success: true,
      message: "Pet deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete pet",
    });
  }
});

// ✅ 5️⃣ Get All Pets
const getAllPets = asyncHandler(async (req, res) => {
  try {
    // Optional query parameters
    const { ownerId, species, isActive } = req.query;
    const filter = {};

    if (ownerId) filter.ownerId = ownerId;
    if (species) filter.species = species;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const pets = await Pet.find(filter)
      .populate("ownerId", "username email firstName lastName")
      .populate("collarId", "deviceId isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch pets",
    });
  }
});

// ✅ 6️⃣ Update Pet Location
const updatePetLocation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinates, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid pet ID format",
      });
    }

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid coordinates format. Expected [longitude, latitude]",
      });
    }

    const pet = await Pet.findByIdAndUpdate(
      id,
      {
        lastKnownLocation: {
          type: "Point",
          coordinates: coordinates,
          address: address || "",
          timestamp: new Date(),
        },
        lastActivityUpdate: new Date(),
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: "Pet not found",
      });
    }

    res.json({
      success: true,
      message: "Pet location updated successfully",
      data: {
        location: pet.lastKnownLocation,
      },
    });
  } catch (error) {
    console.error("Error updating pet location:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update pet location",
    });
  }
});

export {
  registerPet,
  getPetDetails,
  updatePetDetails,
  deletePet,
  getAllPets,
  updatePetLocation,
};
