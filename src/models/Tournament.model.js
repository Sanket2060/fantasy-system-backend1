import mongoose from "mongoose";
const { Schema } = mongoose;

const tournamentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rules: {
    type: String,
    required: true,
  },
  registrationLimits: {
    type: Number,
    required: true,
  },
  teamDetails: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  franchises: [
    {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
    },
  ],
  playerLimitPerTeam: {
    type: Number,
    required: true,
  },
  knockoutStart: { type: Date, required: true },
  semifinalStart: { type: Date, required: true },
  finalStart: { type: Date, required: true },
});

const Tournament = mongoose.model("Tournament", tournamentSchema);
export default Tournament;
