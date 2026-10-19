import dbconnect from "@/lib/DbConnect"
import Memory from "@/Models/Memory"
import { tool } from "@langchain/core/tools"
import z from "zod"

// TODO: if the memory makes large in size use RAG
 export const SaveMemory = tool(async function({fact , category}) {

  await dbconnect()

  console.log("Fact" , fact)
  console.log("Category" , category)

  console.log("Save memory tool invoked")

 const res = await Memory.create({UserID: 'Athashri' , fact , category})

 return {res}

} , {
  name: "SaveMemory",
  description: "Save a lasting fact about the user: preferences, goals, people, routines. Do NOT save temporary things like today's task.",
  schema: z.object({
    fact: z.string(),
    category: z.enum(['goal' , 'routine' , 'preference' , 'general']),
  })
})


