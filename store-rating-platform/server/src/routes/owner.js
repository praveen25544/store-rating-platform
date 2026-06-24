import { Router } from "express";
import { prisma } from "../db.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { asyncHandler, average } from "../utils.js";

const router = Router();

router.use(authenticate, requireRoles("OWNER"));

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const store = await prisma.store.findUnique({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true, address: true }
            }
          },
          orderBy: { updatedAt: "desc" }
        }
      }
    });

    if (!store) {
      return res.json({
        store: null,
        averageRating: 0,
        ratings: []
      });
    }

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      },
      averageRating: average(store.ratings),
      ratings: store.ratings.map((rating) => ({
        id: rating.id,
        value: rating.value,
        updatedAt: rating.updatedAt,
        user: rating.user
      }))
    });
  })
);

export default router;
