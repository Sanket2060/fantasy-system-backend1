import express from "express";
import Player from "../models/Player.model.js";
import { verifyJWT, authorizeAdmin } from "../middlewares/auth.middleware.js";
import Franchise from "../models/Franchise.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

// Admin route to add a new player to a tournament
router.post(
  "/addNewPlayer",
  verifyJWT,
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    const { name, price, photo, tournamentId, matches, franchiseId,playerType } = req.body;

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

      const player = new Player({
        name,
        price,
        photo,
        tournamentId,
        franchise: franchiseId,
        matches,
        playerType
      });
      await player.save();
      res.status(201).send(player);
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
  verifyJWT,
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

export default router;
