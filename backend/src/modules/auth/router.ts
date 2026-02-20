import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '@/modules/users/model';
import { auth } from '@/middleware/auth';
import { sendVerificationEmail, sendWelcomeEmail } from '@/utils/email';
import { config } from '@/config';

const router = Router();

// Register
router.post('/register', [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const isAdmin = req.body.role === 'admin' || email === 'admin@noboraz.com';
        const hashedPassword = await bcrypt.hash(password, 10);

        if (isAdmin) {
            const user = new User({
                name,
                email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            await user.save();
            return res.status(201).json({
                message: 'Admin registration successful!',
                requiresVerification: false,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: true,
                    role: 'admin'
                }
            });
        } else {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const user = new User({
                name,
                email,
                password: hashedPassword,
                role: 'customer',
                isVerified: false,
                verificationToken,
                verificationTokenExpires
            });
            await user.save();

            try {
                await sendVerificationEmail(email, name, verificationToken);
                console.log(`✅ Verification email sent to ${email}`);
            } catch (emailError) {
                console.error('❌ Failed to send verification email:', emailError);
            }

            return res.status(201).json({
                message: 'Registration successful! Please check your email to verify your account.',
                requiresVerification: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: false
                }
            });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify Email
router.get('/verify-email/:token', async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification link. Please request a new one.'
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        const jwtToken = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwt.secret,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Email verified successfully! Welcome to Noboraz!',
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: true
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Resend verification email
router.post('/resend-verification', [
    body('email').isEmail().normalizeEmail()
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If an account exists with this email, a verification link has been sent.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified. You can login.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();

        try {
            await sendVerificationEmail(email, user.name, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        res.json({ message: 'Verification email sent! Please check your inbox.' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified && user.role !== 'admin') {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                requiresVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwt.secret,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/profile', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's saved addresses
router.get('/addresses', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id).select('savedAddresses');
        res.json(user?.savedAddresses || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new address
router.post('/addresses', auth, [
    body('label').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('phone').notEmpty().trim(),
    body('street').notEmpty().trim(),
    body('city').notEmpty().trim(),
    body('type').isIn(['shipping', 'billing', 'both'])
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findById(req.user!._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.isDefault) {
            user.savedAddresses.forEach((addr: any) => addr.isDefault = false);
        }

        if (user.savedAddresses.length === 0) {
            req.body.isDefault = true;
        }

        user.savedAddresses.push(req.body);
        await user.save();

        res.status(201).json(user.savedAddresses);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update address
router.put('/addresses/:addressId', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = (user.savedAddresses as any).id(req.params.addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (req.body.isDefault) {
            user.savedAddresses.forEach((addr: any) => addr.isDefault = false);
        }

        Object.assign(address, req.body);
        await user.save();

        res.json(user.savedAddresses);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete address
router.delete('/addresses/:addressId', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = (user.savedAddresses as any).id(req.params.addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = address.isDefault;
        address.deleteOne();

        if (wasDefault && user.savedAddresses.length > 0) {
            (user.savedAddresses[0] as any).isDefault = true;
        }

        await user.save();
        res.json(user.savedAddresses);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
