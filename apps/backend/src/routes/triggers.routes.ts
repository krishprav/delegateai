import { Router } from "express";
import {
  createTrigger,
  getAllTriggers,
} from "../controllers";
import { isLoggedIn } from "../middlewares";

const router = Router();

router.get("/all", isLoggedIn, getAllTriggers);
router.post("/create", createTrigger);


export default router;
