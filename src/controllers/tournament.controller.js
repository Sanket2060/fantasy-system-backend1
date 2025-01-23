import Tournament from "../models/Tournament.model.js";
import Franchise from "../models/Franchise.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import MatchDetails from "../models/MatchDetails.model.js";

export const addNewTournament = asyncHandler(async (req, res) => {
  const {
    name,
    rules,
    registrationLimits,
    franchises,
    playerLimitPerTeam,
    knockoutStart,
    semifinalStart,
    finalStart,
  } = req.body;
  const userId = req.user._id;

  if (
    !name ||
    !rules ||
    !registrationLimits ||
    !franchises ||
    !playerLimitPerTeam ||
    !knockoutStart ||
    !semifinalStart ||
    !finalStart
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

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
    const tournament = await Tournament.create(
      [
        {
          name,
          rules,
          registrationLimits,
          playerLimitPerTeam,
          knockoutStart,
          semifinalStart,
          finalStart,
          createdBy: userId,
        },
      ],
      { session }
    );

    // Create and save each franchise with reference to the tournament
    for (let franchiseData of franchises) {
      const franchise = await Franchise.create(
        [
          {
            ...franchiseData,
            tournamentId: tournament[0]._id,
          },
        ],
        { session }
      );
      // Add the franchise ID to the tournament's franchises array
      tournament[0].franchises.push(franchise[0]._id);
    }

    // Save the updated tournament with franchise references
    await tournament[0].save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Populate the tournament with its franchises
    const foundTournament = await Tournament.findById(tournament[0]._id)
      .populate("franchises")
      .select("-__v");

    res.status(201).json(new ApiResponse(201, foundTournament));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

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
});

// Controller to retrieve tournaments based on user's ID
export const getTournamentsByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user is populated with the authenticated user's details

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const tournaments = await Tournament.find({ createdBy: userId })
      .populate("franchises", "name")
      .select(
        "name rules registrationLimits playerLimitPerTeam knockoutStart semifinalStart finalStart"
      );

    if (!tournaments || tournaments.length === 0) {
      throw new ApiError(404, "No tournaments registered yet");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, tournaments, "Tournaments retrieved successfully")
      );
  } catch (error) {
    next(error);
  }
});

// Controller to retrieve franchises based on tournament ID
export const getFranchisesByTournamentId = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  console.log("tournamentId", tournamentId);

  if (!tournamentId) {
    throw new ApiError(400, "Tournament ID is required");
  }
  // Validate tournamentId
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    return res.status(404).json(new ApiResponse(404, "Not a valid tournament"));
  }

  try {
    const tournament =
      await Tournament.findById(tournamentId).populate("franchises");

    if (!tournament) {
      res.status(404).json(new ApiResponse(404, {}, "Tournament not found"));
    }

    const franchises = tournament.franchises;

    res
      .status(200)
      .json(
        new ApiResponse(200, franchises, "Franchises retrieved successfully")
      );
  } catch (error) {
    console.error("Error retrieving franchises", error);
    throw new ApiError(500, "Something went wrong while retrieving franchises");
  }
});

export const getMatchDetailsByTournamentId = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  if (!tournamentId) {
    throw new ApiError(400, "Tournament ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
    throw new ApiError(400, "Invalid Tournament ID");
  }

  try {
    const tournament =
      await Tournament.findById(tournamentId).populate("matches");

    if (!tournament) {
      throw new ApiError(404, "Tournament not found");
    }

    const matches = await MatchDetails.find({ tournament: tournamentId });

    if (matches.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            {},
            "No match details found for the specified tournament"
          )
        );
    }

    res
      .status(200)
      .json(new ApiResponse(200, matches, "Matches retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving match details", error);
    throw new ApiError(
      500,
      "Something went wrong while retrieving match details"
    );
  }
});
