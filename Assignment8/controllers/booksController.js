import Book from "../models/Book.js";

export const insertBook = async (req, res) => {

    const book = await Book.create({
        title: "Future",
        author: "John",
        year: 2020,
        genres: ["Science Fiction"]
    });

    res.json(book);
};

export const insertManyBooks = async (req, res) => {

    const books = await Book.insertMany([
        {
            title: "Brave New World",
            author: "Aldous Huxley",
            year: 1932,
            genres: ["Science Fiction"]
        },
        {
            title: "Harry Potter",
            author: "J.K Rowling",
            year: 2005,
            genres: ["Fantasy"]
        },
        {
            title: "Dracula",
            author: "Bram Stoker",
            year: 1998,
            genres: ["Horror"]
        }
    ]);

    res.json(books);
};

export const updateBook = async (req, res) => {

    const book = await Book.findOneAndUpdate(
        { title: req.params.title },
        { year: 2022 },
        { new: true }
    );

    res.json(book);
};

export const findBookByTitle = async (req, res) => {

    const book = await Book.findOne({
        title: req.query.title
    });

    res.json(book);
};

export const booksBetweenYears = async (req, res) => {

    const books = await Book.find({
        year: {
            $gte: Number(req.query.from),
            $lte: Number(req.query.to)
        }
    });

    res.json(books);
};

export const booksByGenre = async (req, res) => {

    const books = await Book.find({
        genres: req.query.genre
    });

    res.json(books);
};

export const skipLimitBooks = async (req, res) => {

    const books = await Book.find()
    .sort({ year: -1 })
    .skip(2)
    .limit(3);

    res.json(books);
};

export const integerYearBooks = async (req, res) => {

    const books = await Book.find({
        year: {
            $type: "int"
        }
    });

    res.json(books);
};

export const excludeGenres = async (req, res) => {

    const books = await Book.find({
        genres: {
            $nin: ["Horror", "Science Fiction"]
        }
    });

    res.json(books);
};

export const deleteBooksBeforeYear = async (req, res) => {

    const result = await Book.deleteMany({
        year: {
            $lt: Number(req.query.year)
        }
    });

    res.json(result);
};

export const aggregate1 = async (req, res) => {

    const books = await Book.aggregate([
        {
            $match: {
                year: { $gt: 2000 }
            }
        },
        {
            $sort: {
                year: -1
            }
        }
    ]);

    res.json(books);
};

export const aggregate2 = async (req, res) => {

    const books = await Book.aggregate([
        {
            $match: {
                year: { $gt: 2000 }
            }
        },
        {
            $project: {
                _id: 0,
                title: 1,
                author: 1,
                year: 1
            }
        }
    ]);

    res.json(books);
};

export const aggregate3 = async (req, res) => {

    const books = await Book.aggregate([
        {
            $unwind: "$genres"
        }
    ]);

    res.json(books);
};

export const aggregate4 = async (req, res) => {

    const books = await Book.aggregate([
        {
            $lookup: {
                from: "logs",
                localField: "title",
                foreignField: "message",
                as: "logsData"
            }
        }
    ]);

    res.json(books);
};