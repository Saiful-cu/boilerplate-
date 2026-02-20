import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/logger';
import { config } from '@/config';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_SIZE = config.upload.maxImageSize;
const MAX_VIDEO_SIZE = config.upload.maxVideoSize;
const MAX_FILE_SIZE = config.upload.maxFileSize;

// Configure memory storage for GridFS
const storage = multer.memoryStorage();

// File filter with enhanced validation
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        logger.warn(`Rejected file upload: Invalid mime type ${file.mimetype}`);
        return cb(new Error(`File type ${file.mimetype} is not allowed.`));
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.mov'];

    if (!validExtensions.includes(ext)) {
        logger.warn(`Rejected file upload: Invalid extension ${ext}`);
        return cb(new Error(`File extension ${ext} is not allowed`));
    }

    const filename = file.originalname.toLowerCase();
    const suspiciousPatterns = ['.php', '.exe', '.sh', '.bat', '.cmd', '.js', '.html', '.htm'];

    for (const pattern of suspiciousPatterns) {
        if (filename.includes(pattern)) {
            logger.warn(`Rejected file upload: Suspicious filename ${file.originalname}`);
            return cb(new Error('Suspicious filename detected'));
        }
    }

    cb(null, true);
};

// Error handling middleware for multer
export const handleUploadError = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ success: false, message: 'File too large. Maximum size allowed is 50MB.' });
            return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({ success: false, message: 'Too many files. Maximum 10 files allowed.' });
            return;
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({ success: false, message: 'Unexpected field in upload.' });
            return;
        }
        res.status(400).json({ success: false, message: err.message });
        return;
    }

    if (err) {
        logger.error('Upload error:', err);
        res.status(400).json({ success: false, message: err.message });
        return;
    }

    next();
};

// Upload configuration
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

// Image-only upload with stricter limits
export const uploadImageOnly = multer({
    storage,
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: MAX_IMAGE_SIZE, files: 10 },
});

// Video-only upload with larger limits
export const uploadVideoOnly = multer({
    storage,
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
            return cb(new Error('Only video files are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: MAX_VIDEO_SIZE, files: 1 },
});

// Multiple images upload (up to 10)
export const uploadImages = upload.array('images', 10);

// Single video upload
export const uploadVideo = uploadVideoOnly.single('video');

// Mixed upload (images + video)
export const uploadMixed = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
]);

// Single image upload
export const uploadSingleImage = uploadImageOnly.single('image');
