// routes/matchRoutes.js
import express from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import MatchDetails from "../models/MatchDetails.model.js";
import { authorizeAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import Player from "../models/Player.model.js";
import Tournament from "../models/Tournament.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

// Route for adding match details
router.post(
  "/add",
  verifyJWT,
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    const {
      matchNumber,
      matchName,
      playersPlayedTeam1,
      playersPlayedTeam2,
      score,
      goalsScoredBy,
      cardsObtained,
      penaltiesMissed,
      tournament_id,
    } = req.body;

    // Validate required fields
    if (
      !matchNumber ||
      !matchName ||
      !playersPlayedTeam1 ||
      !playersPlayedTeam2 ||
      !score ||
      !tournament_id
    ) {
      throw new ApiError(400, "All required fields must be provided");
    }

    // Validate tournament ID
    const tournament = await Tournament.findById(tournament_id);
    if (!tournament) {
      throw new ApiError(400, "Invalid tournament ID");
    }

    // Validate player IDs
    const validatePlayerIds = async (playerIds) => {
      for (const playerId of playerIds) {
        const player = await Player.findById(playerId);
        if (!player) {
          throw new ApiError(400, `Invalid player ID: ${playerId}`);
        }
      }
    };

    await validatePlayerIds(playersPlayedTeam1);
    await validatePlayerIds(playersPlayedTeam2);
    if (goalsScoredBy) {
      for (const goal of goalsScoredBy) {
        const player = await Player.findById(goal.player);
        if (!player) {
          throw new ApiError(
            400,
            `Invalid player ID in goalsScoredBy: ${goal.player}`
          );
        }
        if (goal.assists) {
          await validatePlayerIds(goal.assists);
        }
      }
    }
    if (cardsObtained) {
      if (cardsObtained.yellow) {
        await validatePlayerIds(cardsObtained.yellow);
      }
      if (cardsObtained.red) {
        await validatePlayerIds(cardsObtained.red);
      }
    }
    if (penaltiesMissed) {
      await validatePlayerIds(penaltiesMissed);
    }

    // Check if a match with the same matchNumber already exists in the tournament
    const matchExists = await MatchDetails.findOne({
      matchNumber,
      tournament: tournament_id,
    });
    if (matchExists) {
      throw new ApiError(400, "Match number already exists in this tournament");
    }
    

    // Create the match details document
    const match = await MatchDetails.create({
      matchNumber,
      matchName,
      playersPlayedTeam1,
      playersPlayedTeam2,
      score,
      goalsScoredBy,
      cardsObtained,
      penaltiesMissed,
    });

    // Validate tournament ID
    tournament.matches.push(match._id);
    await tournament.save();

    if (match) {
      res
        .status(201)
        .json(new ApiResponse("Match details added successfully", match));
    } else {
      throw new ApiError(500, "Failed to add match details");
    }
  })
);

export default router;
