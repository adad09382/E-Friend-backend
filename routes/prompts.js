import express from "express";
import * as auth from "../middlewares/auth.js";
import { uploadImageMiddleware } from "../middlewares/upload.js";
import admin from "../middlewares/admin.js";
import contentType from "../middlewares/contentType.js";
import { create, getAll, get, edit } from "../controllers/prompts.js";

const router = express.Router();

router.post(
  "/",
  auth.jwt,
  admin,
  contentType("multipart/form-data"),
  uploadImageMiddleware,
  create
);

router.get("/all", auth.jwt, admin, getAll);

router.get("/", get);

router.patch(
  "/:id",
  auth.jwt,
  admin,
  contentType("multipart/form-data"),
  uploadImageMiddleware,
  edit
);

export default router;
