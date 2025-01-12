import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the Match schema to store points for each match
const matchSchema = new Schema({
    matchNumber: {
        type: Number,
        required: true
    },
    points: {
        type: Number,
        default: 0
    }
});

export default matchSchema;