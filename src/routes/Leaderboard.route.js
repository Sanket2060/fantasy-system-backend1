import express from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Tournament from "../models/Tournament.model.js";
import { ApiError } from "../utils/ApiError.js";
import Team from "../models/Team.model.js";

const router = express.Router();

// route to provide leaderboard of a specific tournament
router.get(
  "/getLeaderboard/:tournamentId",
  asyncHandler(async (req, res) => {
    try {
      const { tournamentId } = req.params;
      if (!tournamentId) {
        res.json(new ApiResponse(400, {}, "Tournament Id is required"));
      }
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        res.json(new ApiResponse(404, {}, "Tournament  not found"));
      }
      const leaderboard = await Team.find(
        { tournamentId },
        "name _id totalPoints" //retrieve these fields only
      )
        .sort({
          totalPoints: -1,
        })
        .limit(10);
      console.log("reached checking tournaments");
      res.json(
        new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
      );
    } catch (error) {
      console.error("Error while fetching leaderboard", error);
      throw new ApiError(500, "Can't fetch Leaderboard at the moment");
    }
  })
);
export default router;
