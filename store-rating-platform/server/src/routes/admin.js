import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../db.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import {
  addressRule,
  commonFilterRules,
  emailRule,
  idParamRule,
  nameRule,
  optionalOwnerRule,
  passwordRule,
  roleRule,
  validate
} from "../middleware/validators.js";
import { asyncHandler, average, getSort, publicUser } from "../utils.js";

const router = Router();

router.use(authenticate, requireRoles("ADMIN"));

const userWhere = (query) => ({
  ...(query.name ? { name: { contains: query.name, mode: "insensitive" } } : {}),
  ...(query.email ? { email: { contains: query.email, mode: "insensitive" } } : {}),
  ...(query.address ? { address: { contains: query.address, mode: "insensitive" } } : {}),
  ...(query.role ? { role: query.role } : {})
});

const storeWhere = (query) => ({
  ...(query.name ? { name: { contains: query.name, mode: "insensitive" } } : {}),
  ...(query.email ? { email: { contains: query.email, mode: "insensitive" } } : {}),
  ...(query.address ? { address: { contains: query.address, mode: "insensitive" } } : {})
});

const withStoreRating = (store) => ({
  id: store.id,
  name: store.name,
  email: store.email,
  address: store.address,
  ownerId: store.ownerId,
  ownerName: store.owner?.name || "",
  rating: average(store.ratings)
});

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ]);

    res.json({ totalUsers, totalStores, totalRatings });
  })
);

router.post(
  "/users",
  [nameRule, emailRule, addressRule, passwordRule, roleRule, validate],
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        passwordHash,
        role: req.body.role
      }
    });

    res.status(201).json({ user: publicUser(user) });
  })
);

router.post(
  "/stores",
  [nameRule, emailRule, addressRule, optionalOwnerRule, validate],
  asyncHandler(async (req, res) => {
    const ownerId = req.body.ownerId || null;

    if (ownerId) {
      const owner = await prisma.user.findFirst({ where: { id: ownerId, role: "OWNER" } });

      if (!owner) {
        return res.status(422).json({ message: "Selected owner must have the OWNER role." });
      }
    }

    const store = await prisma.store.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        ownerId
      },
      include: { owner: true, ratings: true }
    });

    res.status(201).json({ store: withStoreRating(store) });
  })
);

router.get(
  "/stores",
  [...commonFilterRules, validate],
  asyncHandler(async (req, res) => {
    const { sortBy, sortOrder } = getSort(req.query, ["name", "email", "address", "rating"]);
    const stores = await prisma.store.findMany({
      where: storeWhere(req.query),
      include: { owner: true, ratings: true },
      orderBy: sortBy === "rating" ? undefined : { [sortBy]: sortOrder }
    });

    const result = stores.map(withStoreRating);

    if (sortBy === "rating") {
      result.sort((a, b) => (sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating));
    }

    res.json({ stores: result });
  })
);

router.get(
  "/users",
  [...commonFilterRules, validate],
  asyncHandler(async (req, res) => {
    const { sortBy, sortOrder } = getSort(req.query, ["name", "email", "address", "role"]);
    const users = await prisma.user.findMany({
      where: userWhere(req.query),
      include: {
        ownedStore: { include: { ratings: true } }
      },
      orderBy: { [sortBy]: sortOrder }
    });

    res.json({
      users: users.map((user) => ({
        ...publicUser(user),
        storeRating: user.ownedStore ? average(user.ownedStore.ratings) : null
      }))
    });
  })
);

router.get(
  "/users/:id",
  [idParamRule, validate],
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        ownedStore: { include: { ratings: true } }
      }
    });

    res.json({
      user: {
        ...publicUser(user),
        storeRating: user.ownedStore ? average(user.ownedStore.ratings) : null
      }
    });
  })
);

export default router;
