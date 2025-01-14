import Tournament from "../models/Tournament.model.js";
import Franchise from "../models/Franchise.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const addNewTournament = async (req, res) => {
  const { name, rules, registrationLimits, franchises } = req.body;

  try {
    // Check if franchise names are unique within the tournament
    const franchiseNames = franchises.map((f) => f.name.toLowerCase());
    const duplicateFranchise = franchiseNames.find(
      (name, index) => franchiseNames.indexOf(name) !== index
    );

    if (duplicateFranchise) {
      throw new ApiError(
        400,
        `Franchise name '${duplicateFranchise}' must be unique within the tournament`
      );
    }

    // Create and save the tournament
    const tournament = await Tournament.create({
      name,
      rules,
      registrationLimits,
    });

    // Create and save each franchise with reference to the tournament
    for (let franchiseData of franchises) {
      const franchise = await Franchise.create({
        ...franchiseData,
        tournamentId: tournament._id,
      });
      // Add the franchise ID to the tournament's franchises array
      tournament.franchises.push(franchise._id);
    }

    // Save the updated tournament with franchise references
    await tournament.save();

    // Populate the tournament with its franchises
    const foundTournament = await Tournament.findById(tournament._id);

    res.status(201).json(new ApiResponse(201, foundTournament));
  } catch (error) {
    console.log("ERROR", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }
    console.error("Error at creating tournament", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Something went wrong while adding new tournament")
      );
  }
};
