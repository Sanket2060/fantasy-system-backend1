import mongoose from "mongoose";

const upcomingMatchSchema = new mongoose.Schema(
  {
    matchNumber: {
      type: Number,
      required: true,
    },
    matchName: {
      type: String,
      required: true,
    },
    matchDate: {
      type: Date, // contains both date and time
      required: true,
    },
    creator:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
  },
  { timestamps: true }
);

export const UpcomingMatch = mongoose.model("UpcomingMatch", upcomingMatchSchema);
