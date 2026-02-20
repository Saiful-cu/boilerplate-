import { Router, Request, Response } from 'express';
import { Readable } from 'stream';
import { uploadImages, uploadVideo, uploadMixed } from '@/middleware/upload';
import { adminAuth } from '@/middleware/auth';
import { getGridFSBucket } from '@/lib/mongo';

const router = Router();

// Helper function to upload file to GridFS
const uploadToGridFS = (file: Express.Multer.File): Promise<{ fileId: string; filename: string; contentType: string }> => {
    return new Promise((resolve, reject) => {
        const bucket = getGridFSBucket();
        const filename = `${Date.now()}-${file.originalname}`;

        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: {
                originalName: file.originalname,
                uploadDate: new Date()
            }
        });

        const readableStream = Readable.from(file.buffer);

        readableStream.pipe(uploadStream)
            .on('error', (error: Error) => reject(error))
            .on('finish', () => {
                resolve({
                    fileId: uploadStream.id.toString(),
                    filename: filename,
                    contentType: file.mimetype
                });
            });
    });
};

// Upload multiple images
router.post('/images', adminAuth, (req: Request, res: Response) => {
    uploadImages(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        try {
            const files = req.files as Express.Multer.File[];
            const uploadPromises = files.map(file => uploadToGridFS(file));
            const results = await Promise.all(uploadPromises);

            const imageUrls = results.map(result => `/api/files/${result.fileId}`);

            res.json({
                message: 'Images uploaded successfully',
                urls: imageUrls
            });
        } catch (error: any) {
            console.error('Error uploading to GridFS:', error);
            res.status(500).json({ message: 'Error uploading files', error: error.message });
        }
    });
});

// Upload single video
router.post('/video', adminAuth, (req: Request, res: Response) => {
    uploadVideo(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const result = await uploadToGridFS(req.file);
            const videoUrl = `/api/files/${result.fileId}`;

            res.json({
                message: 'Video uploaded successfully',
                url: videoUrl
            });
        } catch (error: any) {
            console.error('Error uploading to GridFS:', error);
            res.status(500).json({ message: 'Error uploading file', error: error.message });
        }
    });
});

// Upload images and video together
router.post('/mixed', adminAuth, (req: Request, res: Response) => {
    uploadMixed(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const response: any = {};
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (files['images']) {
                const uploadPromises = files['images'].map(file => uploadToGridFS(file));
                const results = await Promise.all(uploadPromises);
                response.imageUrls = results.map(result => `/api/files/${result.fileId}`);
            }

            if (files['video'] && files['video'][0]) {
                const result = await uploadToGridFS(files['video'][0]);
                response.videoUrl = `/api/files/${result.fileId}`;
            }

            if (!response.imageUrls && !response.videoUrl) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            res.json({
                message: 'Files uploaded successfully',
                ...response
            });
        } catch (error: any) {
            console.error('Error uploading to GridFS:', error);
            res.status(500).json({ message: 'Error uploading files', error: error.message });
        }
    });
});

export default router;
