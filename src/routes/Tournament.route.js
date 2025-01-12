import express from "express";
import Tournament from "../models/Tournament.model.js";
import { verifyJWT, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { addNewTournament } from "../controllers/tournament.conroller.js";

const router = express.Router();

// Admin route to add a new tournament
router.post("/new", verifyJWT, authorizeAdmin, addNewTournament);

export default router;
