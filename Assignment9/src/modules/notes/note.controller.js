import Note from "./note.model.js";

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user.userId,
  });

  res.json({
    message: "Created",
    note,
  });
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    {
      _id: noteId,
      userId: req.user.userId,
    },
    req.body,
    { new: true }
  );

  res.json({
    message: "Updated",
    note,
  });
};

export const replaceNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndReplace(
    {
      _id: noteId,
      userId: req.user.userId,
    },
    req.body,
    { new: true }
  );

  res.json({
    message: "Replaced",
    note,
  });
};

export const updateAllTitles = async (req, res) => {
  const { title } = req.body;

  const result = await Note.updateMany(
    { userId: req.user.userId },
    { title }
  );

  res.json({
    message: "Done",
    result,
  });
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user.userId,
  });

  res.json({
    message: "Deleted",
    note,
  });
};

export const paginateNotes = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 2;

  const skip = (page - 1) * limit;

  const notes = await Note.find({
    userId: req.user.userId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    message: "Done",
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  res.json({
    message: "Done",
    note,
  });
};

export const getByContent = async (req, res) => {
  const note = await Note.findOne({
    content: req.query.content,
    userId: req.user.userId,
  });

  res.json({
    message: "Done",
    note,
  });
};

export const noteWithUser = async (req, res) => {
  const notes = await Note.find({
    userId: req.user.userId,
  })
    .select("title userId createdAt")
    .populate("userId", "email");

  res.json({
    message: "Done",
    notes,
  });
};

export const aggregateNotes = async (req, res) => {
  const title = req.query.title;

  const notes = await Note.aggregate([
    {
      $match: {
        userId: req.user.userId,
        title: { $regex: title, $options: "i" },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    {
      $project: {
        title: 1,
        content: 1,
        "user.name": 1,
        "user.email": 1,
      },
    },
  ]);

  res.json({
    message: "Done",
    notes,
  });
};

export const deleteAllNotes = async (req, res) => {
  const result = await Note.deleteMany({
    userId: req.user.userId,
  });

  res.json({
    message: "Deleted",
    result,
  });
};