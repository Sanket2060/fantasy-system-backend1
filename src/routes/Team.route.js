// Import necessary modules
import express from "express";
import Team from "../models/Team.model.js";
import Player from "../models/Player.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import Tournament from "../models/Tournament.model.js";
import checkUpdateWindowAndConsumeTicket from "../middlewares/checkUpdateWindowAndConsumeTicket.js";

const router = express.Router();
// Route to create a new team
router.post(
  "/create",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { name, players, budget, tournamentId } = req.body;
    const userId = req.user._id; // Assuming user ID is available in req.user

    try {
      // Check if the players array has exactly the required number of unique values
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

      // Validate player IDs and calculate total budget
      const validPlayers = await Player.find({ _id: { $in: players } });
      if (validPlayers.length !== players.length) {
        throw new ApiError(400, "One or more player IDs are invalid");
      }

      const totalBudget = validPlayers.reduce(
        (acc, player) => acc + player.price,
        0
      );
      if (totalBudget > 100) {
        throw new ApiError(400, "Total budget of players exceeds 100");
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
        `Something went wrong while creating the team: ${error.message}`,
        error.message
      );
    }
  })
);

// Route to update a team
router.put(
  "/:teamId",
  verifyJWT,
  checkUpdateWindowAndConsumeTicket,
  asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { addPlayers, removePlayers } = req.body;
    const userId = req.user._id; // Assuming user ID is available in req.user

    try {
      // Find the team and ensure it belongs to the authenticated user
      const team = await Team.findOne({ _id: teamId, userId });
      if (!team) {
        throw new ApiError(
          404,
          "Team not found or you do not have permission to edit this team"
        );
      }

      // Find the related tournament to get the player limit per team
      const tournament = await Tournament.findById(team.tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      const requiredPlayersCount = tournament.playerLimitPerTeam;

      // Initialize updatedPlayers set with existing team players
      let updatedPlayers = new Set(
        team.players.map((player) => player.toString())
      );

      // Remove players if specified
      if (removePlayers) {
        removePlayers.forEach((playerId) => updatedPlayers.delete(playerId));
      }

      // Add new players if specified
      if (addPlayers) {
        // Validate player IDs to be added
        const validAddPlayers = await Player.find({ _id: { $in: addPlayers } });
        if (validAddPlayers.length !== addPlayers.length) {
          throw new ApiError(
            400,
            "One or more player IDs to be added are invalid"
          );
        }
        addPlayers.forEach((playerId) => updatedPlayers.add(playerId));
      }

      // Validate the number of players
      if (updatedPlayers.size !== requiredPlayersCount) {
        throw new ApiError(
          400,
          `Players array must contain ${requiredPlayersCount} unique player IDs`
        );
      }

      // Validate the total budget
      const validPlayers = await Player.find({
        _id: { $in: Array.from(updatedPlayers) },
      });
      const totalBudget = validPlayers.reduce(
        (acc, player) => acc + player.price,
        0
      );
      if (totalBudget > 100) {
        throw new ApiError(400, "Total budget of players exceeds 100");
      }

      // Update the team players
      team.players = Array.from(updatedPlayers);
      await team.save();

      res
        .status(200)
        .json(new ApiResponse(200, team, "Team updated successfully"));
    } catch (error) {
      console.error("Error updating the team for the user", error.message);
      if (error instanceof ApiError) {
        throw new ApiError(error.statusCode, error.message, error.message);
      }
      throw new ApiError(
        500,
        "Something went wrong while updating the team",
        error.message
      );
    }
  })
);

export default router;
