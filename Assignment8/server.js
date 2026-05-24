import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import booksRoutes from "./routes/booksRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/books", booksRoutes);

app.use("/collection", collectionRoutes);

app.use("/logs", logsRoutes);

app.listen(3000, () => {
    console.log("Server Running");
});