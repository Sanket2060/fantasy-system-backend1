// Import necessary modules
import express from "express";
import Team from "../models/Team.model.js";
import Player from "../models/Player.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import Tournament from "../models/Tournament.model.js";

const router = express.Router();

// Route to create a new team
router.post(
  "/create",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { name, players, budget, tournamentId } = req.body;
    const userId = req.user._id; // Assuming user ID is available in req.user

    try {
      // Check if the players array has exactly 11 unique values
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      const requiredPlayersCount = tournament.playerLimitPerTeam;

      // Validate the number of players
      if (
        players.length !== requiredPlayersCount ||
        new Set(players).size !== players.length
      ) {
        throw new ApiError(
          400,
          `Team must contain ${requiredPlayersCount} unique players`
        );
      }

      // Validate player IDs
      const validPlayers = await Player.find({ _id: { $in: players } });
      if (validPlayers.length !== players.length) {
        throw new ApiError(400, "One or more player IDs are invalid");
      }

      // Create a new team using the create method
      const team = await Team.create({
        name,
        userId,
        players,
        budget,
      });

      // Find the relevant tournament and update its teams array

      tournament.teamDetails.push(team._id);
      await tournament.save();

      res
        .status(201)
        .json(new ApiResponse(201, team, "Team created successfully"));
    } catch (error) {
      console.error("Error creating the team for the user", error.message);
      if (error instanceof ApiError) {
        throw new ApiError(error.statusCode, error.message, error.message);
      }
      throw new ApiError(
        500,
        `Something went wrong while creating the team"${error.message}`,
        error.message
      );
    }
  })
);

export default router;
