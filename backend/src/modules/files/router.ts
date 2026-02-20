import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getGridFSBucket } from '@/lib/mongo';

const router = Router();

// Get file from GridFS
router.get('/:fileId', async (req: Request, res: Response): Promise<void> => {
    try {
        const fileId = req.params.fileId;

        if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
            res.status(400).json({ message: 'Invalid file ID' });
            return;
        }

        const bucket = getGridFSBucket();
        const objectId = new mongoose.Types.ObjectId(fileId);

        const files = await bucket.find({ _id: objectId }).toArray();

        if (!files || files.length === 0) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        const file = files[0];
        if (!file) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        res.set('Content-Type', file.contentType || 'application/octet-stream');
        res.set('Content-Length', String(file.length));
        res.set('Cache-Control', 'public, max-age=31536000');

        const downloadStream = bucket.openDownloadStream(objectId);

        downloadStream.on('error', (error: Error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming file' });
            }
        });

        downloadStream.pipe(res);
    } catch (error: any) {
        console.error('Error retrieving file:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
});

// Delete file from GridFS (Admin only)
router.delete('/:fileId', async (req: Request, res: Response): Promise<void> => {
    try {
        const fileId = req.params.fileId;

        if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
            res.status(400).json({ message: 'Invalid file ID' });
            return;
        }

        const bucket = getGridFSBucket();
        const objectId = new mongoose.Types.ObjectId(fileId);

        await bucket.delete(objectId);

        res.json({ message: 'File deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
});

// Get file metadata
router.get('/:fileId/info', async (req: Request, res: Response): Promise<void> => {
    try {
        const fileId = req.params.fileId;

        if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
            res.status(400).json({ message: 'Invalid file ID' });
            return;
        }

        const bucket = getGridFSBucket();
        const objectId = new mongoose.Types.ObjectId(fileId);

        const files = await bucket.find({ _id: objectId }).toArray();

        if (!files || files.length === 0) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        res.json(files[0]);
    } catch (error: any) {
        console.error('Error retrieving file info:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
