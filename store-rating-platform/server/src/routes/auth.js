import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../db.js";
import { authenticate, createToken } from "../middleware/auth.js";
import {
  addressRule,
  emailRule,
  loginPasswordRule,
  nameRule,
  passwordRule,
  validate
} from "../middleware/validators.js";
import { asyncHandler, publicUser } from "../utils.js";

const router = Router();

router.post(
  "/signup",
  [nameRule, emailRule, addressRule, passwordRule, validate],
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        passwordHash,
        role: "USER"
      }
    });

    res.status(201).json({
      token: createToken(user),
      user: publicUser(user)
    });
  })
);

router.post(
  "/login",
  [emailRule, loginPasswordRule, validate],
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: publicUser(req.user) });
  })
);

router.patch(
  "/password",
  [authenticate, passwordRule, validate],
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    res.json({ message: "Password updated successfully." });
  })
);

export default router;
