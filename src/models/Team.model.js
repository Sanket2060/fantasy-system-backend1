import mongoose from 'mongoose';
const { Schema } = mongoose;

const teamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'Player'
    }],
    budget: {
        type: Number,
        required: true
    },
    totalPoints: {
        type: Number,
        default: 0
    }
});

const Team = mongoose.model('Team', teamSchema);
export default Team;