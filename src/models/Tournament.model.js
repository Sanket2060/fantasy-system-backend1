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
});

const Tournament = mongoose.model("Tournament", tournamentSchema);
export default Tournament;
