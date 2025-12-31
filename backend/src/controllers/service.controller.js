import Service from "../models/Service.js";
import User from "../models/User.js";

export const createService = async (req, res) => {
    const { name, category, price, description, workerId, images, videos } = req.body;
    try {
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        const newService = new Service({
            name,
            category,
            price,
            description,
            workerId,
            workerName: worker.name,
            location: {
                latitude: worker.location.latitude,
                longitude: worker.location.longitude,
                address: `${worker.location.houseNo}, ${worker.location.apartment}`,
            },
            images,
            videos,
        });

        await newService.save();
        res.status(201).json({ success: true, service: newService });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const services = await Service.find().populate("workerId", "name phone location");
        res.json({ success: true, services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getWorkerServices = async (req, res) => {
    const { workerId } = req.params;
    try {
        const services = await Service.find({ workerId });
        res.json({ success: true, services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateService = async (req, res) => {
    const { serviceId } = req.params;
    const updates = req.body;
    try {
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            updates,
            { new: true }
        );
        if (!updatedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.json({ success: true, service: updatedService });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
