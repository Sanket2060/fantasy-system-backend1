import mongoose from "mongoose";
import matchSchema from "./Match.model.js";
const { Schema } = mongoose;

const playerSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  franchise: {
    type: Schema.Types.ObjectId,
    ref: "Franchise",
    required: true,
  },
  matches: [matchSchema], // Include an array of matches
  playerType: {
    type: String,
    required: true,
    enum: ["bowler", "batsman", "allrounder"], // Define the allowed values for playerType
  },
});

const Player = mongoose.model("Player", playerSchema);
export default Player;
