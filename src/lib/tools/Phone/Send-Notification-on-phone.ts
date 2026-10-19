import { tool } from "@langchain/core/tools"
import axios from "axios"
import z from "zod"

// for messing the user on Phone
export const SendNotfiCationOnPhone = tool(async function({Message}) {

  
  console.log("Messsage" , Message)


  // self hosted server
  const res = await axios.post(`https://ntfy-peo3.onrender.com/jarvis-k29x8qpw41` , Message)

  console.log("res" , res.data)
  
  return res.data
} , {
  name: "SendNotificationonPhone",
  description: "Send Notifcation on the phone everyday",
  schema: z.object({
    Message: z.string().describe("The content of the message")
  })
})

