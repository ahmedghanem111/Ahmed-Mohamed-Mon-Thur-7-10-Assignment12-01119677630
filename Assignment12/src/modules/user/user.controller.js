import User from "./user.model.js";

export const deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};