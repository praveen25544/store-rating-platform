import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const jwtSecret = process.env.JWT_SECRET || "dev-secret";

export const createToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: "1d" });

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return res.status(401).json({ message: "Invalid session." });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session." });
  }
};

export const requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have access to this resource." });
  }

  next();
};
