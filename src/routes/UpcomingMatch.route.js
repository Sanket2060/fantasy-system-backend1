import express from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { UpcomingMatch } from "../models/UpcomingMatch.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { authorizeAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST route to add upcoming match (admin only)
router.post(
  "/addmatches",
  verifyJWT,
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { matchNumber, matchName, matchDate ,tournamentId } = req.body;

      if (!matchNumber || !matchName || !matchDate || !tournamentId) {
        throw new ApiError(400, "All fields are required");
      }

      const match = new UpcomingMatch({
        matchNumber,
        matchName,
        matchDate,
        creator: req.user._id,
        tournamentId,
      });
      await match.save();

      res
        .status(201)
        .json(new ApiResponse(201, match, "Upcoming match added successfully"));
    } catch (error) {
      console.error("Error creating match:", error);
      throw new ApiError(500, error.message || "Failed to add upcoming match");
    }
  })
);

// GET route to fetch valid upcoming matches
router.get(
  "/getmatches",
  asyncHandler(async (req, res) => {
    try {
      console.log("reached here");
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Remove expired matches (older than 2 hours past scheduled time)
      await UpcomingMatch.deleteMany({ matchDate: { $lte: twoHoursAgo } });
      // Fetch matches where time has not passed more than 2 hours
      const upcoming = await UpcomingMatch.find().sort({ matchDate: 1 });

      res
        .status(200)
        .json(new ApiResponse(200, upcoming, "Upcoming matches retrieved"));
    } catch (error) {
      console.error("Error fetching matches:", error);
      throw new ApiError(500, error.message || "Failed to retrieve matches");
    }
  })
);

export default router;
