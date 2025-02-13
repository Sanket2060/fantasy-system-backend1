import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema for the Team model
const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tournamentId:{
      type:Schema.Types.ObjectId,
      ref:"Tournament",
      required:true
    },
    players: {
      knockout: [
        {
          type: Schema.Types.ObjectId,
          ref: "Player",
        },
      ],
      semifinal: [
        {
          type: Schema.Types.ObjectId,
          ref: "Player",
        },
      ],
      final: [
        {
          type: Schema.Types.ObjectId,
          ref: "Player",
        },
      ],
    },
    budget: {
      knockout: {
        type: Number,
      },
      semifinal: {
        type: Number,
      },
      final: {
        type: Number,
      },
    },
    points: [
      {
        matchNumber: {
          type: Number,
          required: true,
        },
        teamType: {
          type: String,
          enum: ["knockout", "semifinal", "final"],
          required: true,
        },
        players: [
          {
            playerId: {
              type: Schema.Types.ObjectId,
              ref: "Player",
              required: true,
            },
            points: {
              type: Number,
              required: true,
            },
          },
        ],
        matchNumberPoints: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Check if the Team model already exists before defining it
const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
