import Service from "../models/Service.js";
import User from "../models/User.js";

export const createService = async (req, res) => {
    const { name, category, subCategories, price, description, workerId, images, videos, coverageRadius } = req.body;
    try {
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        const newService = new Service({
            name,
            category,
            subCategories,
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
            coverageRadius,
        });

        await newService.save();
        res.status(201).json({ success: true, service: newService });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const getServices = async (req, res) => {
    const { lat, lng } = req.query;
    try {
        let services = await Service.find().populate("workerId", "name phone location rating");

        if (lat && lng) {
            const customerLat = parseFloat(lat);
            const customerLng = parseFloat(lng);

            services = services.filter(service => {
                if (!service.location || !service.location.latitude || !service.location.longitude) return false;
                const distance = calculateDistance(customerLat, customerLng, service.location.latitude, service.location.longitude);
                return distance <= service.coverageRadius;
            });
        }

        res.json({ success: true, services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getWorkerServices = async (req, res) => {
    const { workerId } = req.params;
    try {
        const services = await Service.find({ workerId }).populate("workerId", "name rating");
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

export const getServiceById = async (req, res) => {
    const { serviceId } = req.params;
    try {
        const service = await Service.findById(serviceId).populate("workerId", "name phone location rating profileImage");
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.json({ success: true, service });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
