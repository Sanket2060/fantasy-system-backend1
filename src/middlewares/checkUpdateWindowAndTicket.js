// middlewares/checkUpdateWindowAndConsumeTicket.js
import Tournament from "../models/Tournament.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Team from "../models/Team.model.js";
import mongoose from "mongoose";

const checkUpdateWindowAndTicket = async (req, res, next) => {
  const userId = req.user._id; // Assuming user ID is available in req.user
  const currentTime = new Date();
  const { teamId } = req.params;

  try {
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
    // const tournamentId = new mongoose.Method.ObjectId(team.tournamentId);

    // Find the related tournament to get the player limit per team
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
      // Consume the ticket
      // user.tickets[phase] = false;
      req.user.phase = phase;
      await user.save();
      next();
    } else {
      res.status(403).json({
        message: "No update tickets available or update window has been closed",
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.log("reached instance of api error");
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      console.error("Error at checkUpdateWindow", error);
      res.status(500).json({
        message: "Error checking update window and consuming ticket",
      });
    }
  }
};

//what if ticket is consumed in the middleware but later the updation creates some sort of error?
export default checkUpdateWindowAndTicket;
