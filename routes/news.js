import express from "express";
import { get, getMore } from "../controllers/news.js";

const router = express.Router();

router.get("/", get);
router.post("/", getMore);

export default router;
