import { Router } from "express";

import auth from "../../middleware/auth.js";

import {
  createNote,
  updateNote,
  replaceNote,
  updateAllTitles,
  deleteNote,
  paginateNotes,
  getNoteById,
  getByContent,
  noteWithUser,
  aggregateNotes,
  deleteAllNotes,
} from "./note.controller.js";

const router = Router();

router.post("/", auth, createNote);

router.patch("/:noteId", auth, updateNote);

router.put("/replace/:noteId", auth, replaceNote);

router.patch("/all", auth, updateAllTitles);

router.delete("/:noteId", auth, deleteNote);

router.get("/paginate-sort", auth, paginateNotes);

router.get("/note-by-content", auth, getByContent);

router.get("/note-with-user", auth, noteWithUser);

router.get("/aggregate", auth, aggregateNotes);

router.delete("/", auth, deleteAllNotes);

router.get("/:id", auth, getNoteById);

export default router;