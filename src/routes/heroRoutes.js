import express from "express";
import { HeroController } from "../controllers/heroController.js";

const router = express.Router();

router.get("/", HeroController.getAll);
router.get("/:id", HeroController.getById);
router.post("/", HeroController.create);
router.put("/:id", HeroController.update);
router.delete("/:id", HeroController.remove);

export default router;