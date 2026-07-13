const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (error) {
        validationErrors.push(...error.details);
      }
    }

    if (validationErrors.length) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validationErrors.map((err) => err.message),
      });
    }

    next();
  };
};

export default validation;