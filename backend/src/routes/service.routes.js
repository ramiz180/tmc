import express from "express";
import { createService, getServices, getWorkerServices, updateService } from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/worker/:workerId", getWorkerServices);
router.put("/:serviceId", updateService);

export default router;
