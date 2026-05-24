import express from "express";
import {
    createBooksCollection,
    createAuthorsCollection,
    createLogsCollection,
    createBooksIndex
} from "../controllers/collectionController.js";

const router = express.Router();

router.post("/books", createBooksCollection);

router.post("/authors", createAuthorsCollection);

router.post("/logs/capped", createLogsCollection);

router.post("/books/index", createBooksIndex);

export default router;