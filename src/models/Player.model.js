import mongoose from "mongoose";
import matchSchema from "./Match.js";
const { Schema } = mongoose;

const playerSchema = new Schema({
  name: {
    type: String,
    required: true,
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
  matches: [matchSchema], // Include an array of matches
});

const Player = mongoose.model("Player", playerSchema);
export default Player;
