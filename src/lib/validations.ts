import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional().nullable(),
  wholesalePrice: z.number().positive().optional().nullable(),
  minOrderQty: z.number().int().min(1).default(1),
  sku: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  specifications: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
});

export const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
  productId: z.string().optional().nullable(),
  type: z.enum(['product', 'contact', 'rfq']).default('product'),
  quantity: z.number().int().positive().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyEmail: z.string().email().optional().nullable(),
  companyPhone: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
});

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'clerk', 'editor']).default('clerk'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'clerk', 'editor']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const contentPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().default(''),
  blocks: z.union([z.string(), z.array(z.any())]).transform(val =>
    typeof val === 'string' ? val : JSON.stringify(val)
  ).default('[]'),
  heroImage: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().optional().default(''),
  coverImage: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  blocks: z.union([z.string(), z.array(z.any())]).transform(val =>
    typeof val === 'string' ? val : JSON.stringify(val)
  ).default('[]'),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email'),
});
