import express from "express";
import * as auth from "../middlewares/auth.js";
import { uploadAudioMiddleware } from "../middlewares/upload.js";
import admin from "../middlewares/admin.js";
import contentType from "../middlewares/contentType.js";
import { create, get, getId, edit } from "../controllers/conversations.js";

const router = express.Router();

router.post("/", auth.jwt, contentType("application/json"), create);
router.get("/", auth.jwt, get);
router.get("/:id", auth.jwt, getId);

router.patch(
  "/:id",
  auth.jwt,
  contentType("multipart/form-data"),
  uploadAudioMiddleware,
  edit
);

export default router;
