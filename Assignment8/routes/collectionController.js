import { mongoose } from "mongoose";
import Book from "../models/Book.js";

export const createBooksCollection = async (req, res) => {

    await mongoose.connection.db.createCollection("books", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["title"],
                properties: {
                    title: {
                        bsonType: "string",
                        minLength: 1
                    }
                }
            }
        }
    });

    res.json({ message: "Books collection created" });
};

export const createAuthorsCollection = async (req, res) => {

    await mongoose.connection.db.collection("authors").insertOne({
        name: "Ahmed"
    });

    res.json({ message: "Authors collection created" });
};

export const createLogsCollection = async (req, res) => {

    await mongoose.connection.db.createCollection("logs", {
        capped: true,
        size: 1024 * 1024
    });

    res.json({ message: "Logs collection created" });
};

export const createBooksIndex = async (req, res) => {

    await Book.collection.createIndex({ title: 1 });

    res.json({ message: "Index created" });
};