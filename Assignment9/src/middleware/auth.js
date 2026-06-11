import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.json({ message: "Token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({ message: "Invalid token" });
    }

    req.user = decoded;

    next();
  });
};

export default auth;