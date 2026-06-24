import { Router } from "express";
import { prisma } from "../db.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { idParamRule, ratingRule, validate } from "../middleware/validators.js";
import { asyncHandler, average, getSort } from "../utils.js";

const router = Router();

router.use(authenticate);

const storeWhere = (query) => ({
  ...(query.name ? { name: { contains: query.name, mode: "insensitive" } } : {}),
  ...(query.address ? { address: { contains: query.address, mode: "insensitive" } } : {})
});

const userStoreRow = (store, userId) => {
  const userRating = store.ratings.find((rating) => rating.userId === userId);

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    overallRating: average(store.ratings),
    userRating: userRating?.value || null
  };
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { sortBy, sortOrder } = getSort(req.query, ["name", "address", "rating"], "name");
    const stores = await prisma.store.findMany({
      where: storeWhere(req.query),
      include: { ratings: true },
      orderBy: sortBy === "rating" ? undefined : { [sortBy]: sortOrder }
    });

    const result = stores.map((store) => userStoreRow(store, req.user.id));

    if (sortBy === "rating") {
      result.sort((a, b) =>
        sortOrder === "asc"
          ? a.overallRating - b.overallRating
          : b.overallRating - a.overallRating
      );
    }

    res.json({ stores: result });
  })
);

router.put(
  "/:id/rating",
  [requireRoles("USER"), idParamRule, ratingRule, validate],
  asyncHandler(async (req, res) => {
    await prisma.store.findUniqueOrThrow({ where: { id: req.params.id } });

    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId: req.params.id
        }
      },
      update: { value: Number(req.body.value) },
      create: {
        value: Number(req.body.value),
        userId: req.user.id,
        storeId: req.params.id
      }
    });

    res.json({ rating });
  })
);

export default router;
