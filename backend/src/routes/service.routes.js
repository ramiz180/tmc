import express from "express";
import {
    createService,
    getServices,
    getWorkerServices,
    updateService,
    getServiceById
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/:serviceId", getServiceById);
router.get("/worker/:workerId", getWorkerServices);
router.put("/:serviceId", updateService);

export default router;
