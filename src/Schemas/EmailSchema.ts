import z from "zod";


export const EmailSchema = z.object({
    subject: z.string(),
    from: z.string(),
    body: z.string()
})