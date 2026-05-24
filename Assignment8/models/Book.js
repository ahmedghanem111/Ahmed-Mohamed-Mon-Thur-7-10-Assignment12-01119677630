import { mongoose } from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: String,
    year: Number,
    genres: [String]
});

export default mongoose.model("Book", bookSchema);