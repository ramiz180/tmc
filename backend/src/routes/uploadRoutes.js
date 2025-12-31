import express from 'express';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload multiple images
router.post('/images', upload.array('images', 5), (req, res) => {
    try {
        const urls = req.files.map(file => file.path);
        res.json({ success: true, urls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload a single video
router.post('/video', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video file uploaded' });
        }
        res.json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
