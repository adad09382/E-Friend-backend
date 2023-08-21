import express from "express";
import * as auth from "../middlewares/auth.js";
import { uploadAudioMiddleware } from "../middlewares/upload.js";
import contentType from "../middlewares/contentType.js";
import {
  create,
  get,
  getLast,
  getId,
  edit,
  aiEdit,
} from "../controllers/conversations.js";

const router = express.Router();

router.post("/", auth.jwt, contentType("application/json"), create);
router.get("/", auth.jwt, get);
router.get("/latest", auth.jwt, getLast);
router.get("/:id", auth.jwt, getId);

router.patch(
  "/:id",
  auth.jwt,
  contentType("multipart/form-data"),
  uploadAudioMiddleware,
  edit
);

router.patch("/:id/response", auth.jwt, aiEdit);

export default router;
