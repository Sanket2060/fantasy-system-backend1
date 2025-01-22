// middlewares/checkUpdateWindowAndConsumeTicket.js
import Tournament from "../models/Tournament.model.js";
import { User } from "../models/User.model.js";

const checkUpdateWindowAndConsumeTicket = async (req, res, next) => {
  const { tournamentId } = req.body; // Assuming tournamentId is provided in the request body
  const userId = req.user._id; // Assuming user ID is available in req.user
  const currentTime = new Date();

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
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
      user.tickets[phase] = false;
      await user.save();
      next();
    } else {
      res.status(403).json({
        message:
          "No update tickets available or updates not allowed at this time.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking update window and consuming ticket",
      error: error.message,
    });
  }
};

export default checkUpdateWindowAndConsumeTicket;
