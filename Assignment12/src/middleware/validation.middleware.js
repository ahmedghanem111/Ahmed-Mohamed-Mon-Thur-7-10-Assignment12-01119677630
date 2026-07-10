
const validation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    next();
  };
};

export default validation;