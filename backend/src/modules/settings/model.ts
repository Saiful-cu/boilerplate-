import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroBanner {
    image: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
}

export interface ISettings {
    siteName: string;
    siteTagline: string;
    logo: string;
    favicon: string;
    heroBanners: IHeroBanner[];
    aboutUsImage: string;
    footerLogo: string;
    emailHeaderImage: string;
    email: string;
    phone: string;
    address: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    currency: string;
    currencySymbol: string;
    taxRate: number;
    shippingFee: number;
    freeShippingThreshold: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    headerBackgroundColor: string;
    footerBackgroundColor: string;
    buttonColor: string;
    buttonHoverColor: string;
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
    fontSize: string;
    headingFontWeight: string;
    bodyFontWeight: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISettingsDoc extends Omit<Document, '_id'>, ISettings {
    _id: string;
}

const SettingsSchema = new Schema(
    {
        _id: { type: String, default: 'site-settings' },
        siteName: { type: String, default: 'Noboraz' },
        siteTagline: { type: String, default: 'Your Trusted Ecommerce Store' },
        logo: { type: String, default: '/logo.svg' },
        favicon: { type: String, default: '/favicon.svg' },
        heroBanners: [
            {
                image: String,
                title: String,
                subtitle: String,
                buttonText: String,
                buttonLink: String,
            },
        ],
        aboutUsImage: { type: String, default: '' },
        footerLogo: { type: String, default: '' },
        emailHeaderImage: { type: String, default: '' },
        email: { type: String, default: 'info@noboraz.com' },
        phone: { type: String, default: '+880 1234-567890' },
        address: { type: String, default: 'Dhaka, Bangladesh' },
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        linkedin: String,
        currency: { type: String, default: 'BDT' },
        currencySymbol: { type: String, default: '৳' },
        taxRate: { type: Number, default: 0 },
        shippingFee: { type: Number, default: 50 },
        freeShippingThreshold: { type: Number, default: 1000 },
        metaTitle: String,
        metaDescription: String,
        metaKeywords: String,
        maintenanceMode: { type: Boolean, default: false },
        maintenanceMessage: String,
        primaryColor: { type: String, default: '#3B82F6' },
        secondaryColor: { type: String, default: '#10B981' },
        accentColor: { type: String, default: '#F59E0B' },
        textColor: { type: String, default: '#1F2937' },
        backgroundColor: { type: String, default: '#F7FAFC' },
        headerBackgroundColor: { type: String, default: '#FFFFFF' },
        footerBackgroundColor: { type: String, default: '#111827' },
        buttonColor: { type: String, default: '#3B82F6' },
        buttonHoverColor: { type: String, default: '#2563EB' },
        primaryFont: { type: String, default: 'Inter' },
        secondaryFont: { type: String, default: 'Roboto' },
        headingFont: { type: String, default: 'Poppins' },
        fontSize: { type: String, default: '16px' },
        headingFontWeight: { type: String, default: '700' },
        bodyFontWeight: { type: String, default: '400' },
    },
    { timestamps: true }
);

export const SettingsModel =
    (mongoose.models.Settings as mongoose.Model<ISettingsDoc>) ||
    mongoose.model<ISettingsDoc>('Settings', SettingsSchema);

export default SettingsModel;
