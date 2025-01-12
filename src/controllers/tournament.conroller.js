export const addNewTournament=async (req, res) => {
    const { name, rules, registrationLimits } = req.body;

    try {
        const tournament = new Tournament({ name, rules, registrationLimits });
        await tournament.save();
        res.status(201).send(tournament);
    } catch (error) {
        res.status(400).send(error);
    }
}