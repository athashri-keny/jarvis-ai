import { tool } from "@langchain/core/tools"
import { SendAIEmail } from "../../Emailtranspoter"
import z from "zod"

// for sending email 
 export const SendEmail = tool(async ({body , subject , Mailto}) => {

    await SendAIEmail(Mailto ,  body , subject)
    return {}
}, {
  name: "Send_Email",
  description: "Send an email. Only call this after the user has explicitly approved the draft reply.",
  schema: z.object({
    Mailto: z.string().describe("Recipient email address only, e.g. name@gmail.com"),
    subject: z.string().describe("Subject line only"),
    body: z.string().describe("Full message text only, no subject, no address"),
  })
})