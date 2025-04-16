import express from "express";
import Player from "../models/Player.model.js";
import { verifyJWT, authorizeAdmin } from "../middlewares/auth.middleware.js";
import Franchise from "../models/Franchise.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

// Admin route to add a new player to a tournament
router.post(
  "/addNewPlayer",
  verifyJWT,
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    const {
      name,
      price,
      photo,
      tournamentId,
      matches,
      franchiseId,
      playerType,
    } = req.body;

    try {
      // Check if a player with the same name already exists in the tournament
      const existingPlayer = await Player.findOne({ name, tournamentId });
      if (existingPlayer) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              "A player with the same name already exists in the tournament"
            )
          );
      }
      const franchise = await Franchise.findById(franchiseId);
      if (!franchise) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Franchise not found"));
      }

      if (franchise.tournamentId.toString() !== tournamentId) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              "Franchise does not belong to the specified tournament"
            )
          );
      }

      const player = new Player({
        name,
        price,
        photo,
        tournamentId,
        franchise: franchiseId,
        matches,
        playerType,
      });
      await player.save();
      res
        .status(201)
        .json(new ApiResponse(201, player, "Player added successfully"));
    } catch (error) {
      console.log("Error while adding new player", error.message);
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            "Something went wrong while adding new player"
          )
        );
    }
  })
);

// Update player points for a specific match
router.patch(
  "/:id/match/:matchNumber/points",
  verifyJWT,
  authorizeAdmin,
  async (req, res) => {
    const { points } = req.body;
    const { id, matchNumber } = req.params;

    try {
      const player = await Player.findById(id);
      if (!player) {
        return res
          .status(404)
          .json(new ApiResponse(400, {}, "Player not found"));
      }

      const match = player.matches.find((m) => m.matchNumber == matchNumber);
      if (match) {
        match.points = points; // Update points if match exists
      } else {
        player.matches.push({ matchNumber, points }); // Add new match if not exists
      }

      await player.save();
      res.send(player);
    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            "Something went wrong while updating player points"
          )
        );
    }
  }
);

// Route to retrieve players of a specific tournament with optional filters
router.get(
  "/:tournamentId/players",
  
  asyncHandler(async (req, res) => {
    const { tournamentId } = req.params;
    const { franchiseId, playerType } = req.query;

    try {
      const query = { tournamentId };

      if (franchiseId) {
        query.franchise = franchiseId;
      }

      if (playerType) {
        query.playerType = playerType;
      }

      const players = await Player.find(query).populate("franchise");

      res.status(200).json(new ApiResponse(200, players));
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while retrieving players",
        error.message
      );
    }
  })
);

// Route to retrieve players by franchise ID and tournament ID
router.get(
  "/:tournamentId/franchises/:franchiseId/players",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { tournamentId, franchiseId } = req.params;

    if (!tournamentId || !franchiseId) {
      throw new ApiError(400, "Tournament ID and Franchise ID are required");
    }

    try {
      const franchise = await Franchise.findById(franchiseId);

      if (!franchise) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Franchise not found"));
      }

      if (franchise.tournamentId.toString() !== tournamentId) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              "Franchise does not belong to the specified tournament"
            )
          );
      }

      const players = await Player.find({
        tournamentId,
        franchise: franchiseId,
      });

      if (players.length === 0) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              {},
              "No players found for the specified franchise and tournament"
            )
          );
      }

      res.status(200).json(new ApiResponse(200, players));
    } catch (error) {
      console.error("Error retrieving players", error);
      throw new ApiError(500, "Something went wrong while retrieving players");
    }
  })
);

//route to get all players of the tournament by tournamentId
// Route to get all players of the tournament by tournamentId
router.get(
  "/:tournamentId/players",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { tournamentId } = req.params;

    // Validate tournamentId
    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid tournament ID"));
    }

    try {
      // Fetch players associated with the tournament
      const players = await Player.find({ tournamentId }).populate("franchise");

      if (players.length === 0) {
        return res.status(404).send(); // No Content
      }

      res
        .status(200)
        .json(new ApiResponse(200, "Players retrieved successfully", players));
    } catch (error) {
      console.error("Error retrieving players", error);
      throw new ApiError(500, "Something went wrong while retrieving players");
    }
  })
);
export default router;
