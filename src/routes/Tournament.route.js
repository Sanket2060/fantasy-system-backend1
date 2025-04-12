import express from "express";
import Tournament from "../models/Tournament.model.js";
import { verifyJWT, authorizeAdmin } from "../middlewares/auth.middleware.js";
import {
  addNewTournament,
  getFranchisesByTournamentId,
  getMatchDetailsByTournamentId,
  getTournamentsByUserId,
  getTournamentsByUserIdAdmin,
} from "../controllers/tournament.controller.js";

const router = express.Router();

// Admin route to add a new tournament
router.post("/new", verifyJWT, authorizeAdmin, addNewTournament);
router.get("/getTournamentsByUserIdAdmin", verifyJWT,authorizeAdmin, getTournamentsByUserIdAdmin);
router.get("/getTournamentByUserId",verifyJWT,getTournamentsByUserId);
router.get("/franchises/:tournamentId", verifyJWT, getFranchisesByTournamentId);

// Route to get match details by tournament ID
router.get("/:tournamentId/matches", verifyJWT, getMatchDetailsByTournamentId);
export default router;
