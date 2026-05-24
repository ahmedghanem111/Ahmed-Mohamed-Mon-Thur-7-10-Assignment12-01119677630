import express  from "express";

import {
    insertBook,
    insertManyBooks,
    updateBook,
    findBookByTitle,
    booksBetweenYears,
    booksByGenre,
    skipLimitBooks,
    integerYearBooks,
    excludeGenres,
    deleteBooksBeforeYear,
    aggregate1,
    aggregate2,
    aggregate3,
    aggregate4
} from "../controllers/booksController.js";

const router = express.Router();

router.post("/", insertBook);

router.post("/batch", insertManyBooks);

router.patch("/:title", updateBook);

router.get("/title", findBookByTitle);

router.get("/year", booksBetweenYears);

router.get("/genre", booksByGenre);

router.get("/skip-limit", skipLimitBooks);

router.get("/year-integer", integerYearBooks);

router.get("/exclude-genres", excludeGenres);

router.delete("/before-year", deleteBooksBeforeYear);

router.get("/aggregate1", aggregate1);

router.get("/aggregate2", aggregate2);

router.get("/aggregate3", aggregate3);

router.get("/aggregate4", aggregate4);

export default router;