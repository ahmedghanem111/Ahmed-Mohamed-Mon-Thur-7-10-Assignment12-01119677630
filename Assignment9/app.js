import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/connection.js";

import userRoutes from "./modules/users/user.routes.js";
import noteRoutes from "./modules/notes/note.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

export default app;