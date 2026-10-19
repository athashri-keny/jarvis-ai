
import { fetchFullContactDetails } from "@/helpers/FetchFullContactDetails"
import { tool } from "@langchain/core/tools"
import z from "zod"




// WHATAPP tools
export const Send_BirthDay_wish_On_Whatapp = tool(async({name , ContactID , Wishes}) => {

  console.log("ContactId" , ContactID)

 const contactNumber =  await fetchFullContactDetails(ContactID)

 console.log("COntact number found (from the tool call " , contactNumber)


 // this encodeURLComponent turns normal string in to url
  const Link = `https://wa.me/${contactNumber}?text=${encodeURIComponent(Wishes)}`

  console.log("Link" , Link)

  return {Link  }
} , {
  name: "Send_BirthDay_wish_on_Whatapp",
  description: "Send a birthday wish to a contact ANd Provide the Whatapp link generated through the tool call in the chat so the User can click on it and open whatap Reply in plain text and put the full WhatsApp link on its own line",
  schema: z.object({
    name: z.string(),
    ContactID: z.string(),
    Wishes: z.string()
  })
})