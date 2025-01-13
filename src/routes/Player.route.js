import express from "express";
import Player from "../models/Player.model.js";
import { verifyJWT, authorizeAdmin } from "../middlewares/auth.middleware.js";
import Franchise from "../models/Franchise.model.js";

const router = express.Router();

// Admin route to add a new player to a tournament
router.post("/addNewPlayer", verifyJWT, authorizeAdmin, async (req, res) => {
  const { name, price, photo, tournamentId, matches, franchiseId } = req.body;

  try {
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).send({ error: "Franchise not found" });
    }

    if (franchise.tournamentId.toString() !== tournamentId) {
      return res.status(400).send({
        error: "Franchise does not belong to the specified tournament",
      });
    }

    const player = new Player({
      name,
      price,
      photo,
      tournamentId,
      franchise: franchiseId,
      matches,
    });
    await player.save();
    res.status(201).send(player);
  } catch (error) {
    res.status(400).send(error);
  }
});

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
        return res.status(404).send({ error: "Player not found" });
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
      res.status(400).send(error);
    }
  }
);

export default router;
