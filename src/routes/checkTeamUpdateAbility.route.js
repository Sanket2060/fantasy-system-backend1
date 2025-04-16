// routes/matchRoutes.js
import express from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import Team from "../models/Team.model.js";
import Tournament from "../models/Tournament.model.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";

const router = express.Router();

// Route for adding match details
router.post(
  "/check/:teamId",
  verifyJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user._id; // Assuming user ID is available in req.user
      const currentTime = new Date();
      const { teamId } = req.params;
      if (!teamId) {
        throw new ApiError(400, "Please provide the teamId");
      }
      // Find the team and ensure it belongs to the authenticated user
      const team = await Team.findOne({ _id: teamId, userId });
      if (!team) {
        throw new ApiError(
          404,
          "Team not found or you do not have permission to edit this team"
        );
      }
      // Find the related tournament
      const tournament = await Tournament.findById(team.tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let phase = null;
      if (currentTime < tournament.knockoutStart && user.tickets.knockout) {
        phase = "knockout";
      } else if (
        currentTime < tournament.semifinalStart &&
        user.tickets.semifinal
      ) {
        phase = "semifinal";
      } else if (currentTime < tournament.finalStart && user.tickets.final) {
        phase = "final";
      }

      if (phase) {
        res.status(200).json({
          status: "success",
          message: "You can update your team",
        });
      } else {
        res.status(403).json({
          status: "false",
          message:
            "No update tickets available or update window has been closed",
        });
      }
    } catch (error) {
      console.log(`Error at checkTeamUpdateAbility: ${error}`);
      if (error instanceof ApiError) {
        throw new ApiError(error.statusCode, error.message);
      }
      throw new ApiError(500, `Error at checkingTeamUpdateAbility`);
    }
  })
);
export default router;
