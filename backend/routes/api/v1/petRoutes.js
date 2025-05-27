import express from "express";
import {
  registerPet,
  getPetDetails,
  updatePetDetails,
  deletePet,
  getAllPets, // Add this import
} from "../../../controllers/pets/petController.js";

const router = express.Router();

router
  .route("/")
  .post(registerPet) // Register a new pet
  .get(getAllPets); // Get all pets

router
  .route("/:id")
  .get(getPetDetails) // Get single pet details
  .put(updatePetDetails) // Update pet details
  .delete(deletePet); // Delete a pet

export default router;
