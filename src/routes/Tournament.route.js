import express from 'express';
import Tournament from '../models/Tournament.model.js';
import { verifyJWT,authorizeAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin route to add a new tournament
router.post('/', verifyJWT, authorizeAdmin, async (req, res) => {
    const { name, rules, registrationLimits } = req.body;

    try {
        const tournament = new Tournament({ name, rules, registrationLimits });
        await tournament.save();
        res.status(201).send(tournament);
    } catch (error) {
        res.status(400).send(error);
    }
});

export default router;