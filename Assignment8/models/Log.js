import { mongoose } from "mongoose";

const logSchema = new mongoose.Schema({
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    capped: {
        size: 1024 * 1024
    }
});

export default mongoose.model("Log", logSchema);