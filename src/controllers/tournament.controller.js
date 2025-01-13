import Tournament from "../models/Tournament.model.js";
import Franchise from "../models/Franchise.model.js";
export const addNewTournament = async (req, res) => {
  const { name, rules, registrationLimits, franchises } = req.body;

  try {
    const tournament = new Tournament({ name, rules, registrationLimits });
    await tournament.save();

    // Create and save each franchise with reference to the tournament
    for (let franchiseData of franchises) {
      const franchise = new Franchise({
        ...franchiseData,
        tournamentId: tournament._id,
      });
      await franchise.save();
    }

    res.status(201).send(tournament);
  } catch (error) {
    res.status(400).send(error);
  }
};
