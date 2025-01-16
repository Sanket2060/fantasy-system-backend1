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
        required: true,
      },
      semifinal: {
        type: Number,
        required: true,
      },
      final: {
        type: Number,
        required: true,
      },
    },
    points: {
      type: Map,
      of: Number,
      default: {},
    },
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
