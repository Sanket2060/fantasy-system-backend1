import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema for the Match model
const matchSchema = new Schema(
  {
    matchNumber: {
      type: Number,
      required: true,
    },
    matchName: {
      type: String,
      required: true,
    },
    // matchType: ["knockout", "semifinal", "final"],
    playersPlayedTeam1: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
    ],
    playersPlayedTeam2: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
    ],
    score: {
      type: String,
      required: true,
    },
    goalsScoredBy: [
      {
        player: {
          type: Schema.Types.ObjectId,
          ref: "Player",
          required: true,
        },
        goals: {
          type: Number,
          required: true,
        },
        assists: [
          {
            type: Schema.Types.ObjectId,
            ref: "Player",
          },
        ],
      },
    ],
    cardsObtained: {
      yellow: [
        {
          type: Schema.Types.ObjectId,
          ref: "Player",
        },
      ],
      red: [
        {
          type: Schema.Types.ObjectId,
          ref: "Player",
        },
      ],
    },
    penaltiesMissed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    penaltySaves: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    ownGoals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
  },
  { timestamps: true }
);

// Check if the Match model already exists before defining it
const MatchDetails = mongoose.model("MatchDetails", matchSchema);

export default MatchDetails;
