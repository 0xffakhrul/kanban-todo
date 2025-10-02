import {z} from 'zod'

export const createStatusSchema = z.object({
    name: z.string().min(1).max(50),
    userId: z.uuid()
})

export const updateStatusSchema = z.object({
    name: z.string().min(1).max(50).optional(),
})