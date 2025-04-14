// Import necessary modules
import express from "express";
import Team from "../models/Team.model.js";
import Player from "../models/Player.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import Tournament from "../models/Tournament.model.js";
import checkUpdateWindowAndTicket from "../middlewares/checkUpdateWindowAndTicket.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";

const router = express.Router();
// Route to create a new team
router.post(
  "/create",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { name, players, tournamentId } = req.body;
    const userId = req.user._id; // Assuming user ID is available in req.user
    if (req.user.role === "admin") {
      console.error("Admin cannot create a team");
      throw new ApiError(403, "Admin cannot create a team");
    }

    try {
      //check if the team name is already taken
      const teamNameExists = await Team.findOne({ name, tournamentId });
      if (teamNameExists) {
        throw new ApiError(
          400,
          "This Team name already exists in this tournament"
        );
      }
      if (!name || !players || !tournamentId) {
        throw new ApiError(400, "All required fields must be provided");
      }
      //check if the player already has a team in this tournament
      const teamExists = await Team.findOne({ userId, tournamentId });
      if (teamExists) {
        throw new ApiError(400, "You already have a team in this tournament");
      }

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
        players: { knockout: players }, //first time team creation so set to the lowest stage the 'knockout'
        budget: { knockout: totalBudget }, //first time team creation so set to the lowest stage the 'knockout'
        tournamentId,
      });

      const user = await User.findById({ userId });
      if (user) {
        user.tickets.knockout = false; //false the updation quota for the knockout(as single updation allowed in single times)
        user.save();
      }

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
        `Something went wrong while creating the team.`,
        error.message
      );
    }
  })
);

// Route to update a team
router.put(
  "/:teamId",
  verifyJWT,
  checkUpdateWindowAndTicket,
  asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { addPlayers, removePlayers } = req.body;
    const userId = req.user._id; // Assuming user ID is available in req.user
    const phase = req.user.phase; //phase got from checkUpdateWindow middleware
    try {
      console.log("teamId", teamId);
      if (!teamId) {
        throw new ApiError(400, "Please provide the teamId");
      }
      console.log("userId", userId);
      // Find the team and ensure it belongs to the authenticated user
      const team = await Team.findOne({ _id: teamId, userId });
      if (!team) {
        throw new ApiError(
          404,
          "Team not found or you do not have permission to edit this team"
        );
      }
      console.log("tournamentId", team.tournamentId);

      // Find the related tournament to get the player limit per team
      const tournament = await Tournament.findById(team.tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      const requiredPlayersCount = tournament.playerLimitPerTeam; //to count total players at end

      // Initialize updatedPlayers set with existing team players
      let updatedPlayers = new Set(
        team.players[phase].map((player) => player.toString()) //which players knockout,semifinal or final  defined using phase
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
      console.log("Final updated list:", updatedPlayers);
      // Validate the number of players
      if (updatedPlayers.size !== requiredPlayersCount) {
        throw new ApiError(
          400,
          `After addition and deletion, total players count doesn't reaches ${requiredPlayersCount}`
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
      team.players[phase] = Array.from(updatedPlayers); //⚠️team.players.teamType(knockout,semifinal,final) defined
      await team.save();

      const user = await User.findById(userId);
      if (user) {
        user.tickets[phase] = false; //false the updation quota for the current phase(as single updation allowed in single times)
        user.save();
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, team.players[phase], "Team updated successfully")
        );
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

//retrieve latest team for the user
router.get(
  "/:teamId",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    try {
      const team = await Team.findById(new mongoose.Types.ObjectId(teamId));
      if (!team) {
        return res.json(new ApiResponse(404, {}, "No Team found from this id"));
      }
      let latestTeamType;
      if (team.players.final.length !== 0) {
        latestTeamType = "final";
      } else if (team.players.semifinal.length !== 0) {
        latestTeamType = "semifinal";
      } else {
        latestTeamType = "knockout";
      }
      let latestTeam = team.players[latestTeamType];
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { latestTeam },
            "Retrieved latest team for user successfully"
          )
        );
    } catch (error) {
      console.error(error);
      res.status(500).json(new ApiResponse(500, {}, "Failed to retrieve team"));
    }
  })
);
router.get(
  "/",
  verifyJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user._id;
      console.log("userId", userId);
      if (!userId) {
        throw new ApiError(400, "User ID is required");
      }

      console.log("Fetching teams for user:", userId); // Debug log

      const teams = await Team.find({ userId })
        .populate({
          path: "tournamentId",
          select: "name knockoutStart semifinalStart finalStart",
        })
        .populate({
          path: "players.knockout",
          select: "name role price playerType photo",
        });

      console.log("Teams found:", teams); // Debug log

      if (!teams || teams.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, [], "No teams found for this user"));
      }

      res
        .status(200)
        .json(new ApiResponse(200, teams, "Teams retrieved successfully"));
    } catch (error) {
      console.error("Error in getTeamsByUserId:", error); // Detailed error log
      throw new ApiError(500, error.message || "Failed to fetch teams");
    }
  })
);

export default router;
