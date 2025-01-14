import mongoose from "mongoose";
const { Schema } = mongoose;

const franchiseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
});

const Franchise = mongoose.model("Franchise", franchiseSchema);
export default Franchise;
