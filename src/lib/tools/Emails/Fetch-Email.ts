import { oAuthClient } from "@/lib/google-auth/oauth-client";
import { tool } from "@langchain/core/tools";
import { google } from "googleapis";

import z from "zod";



 const gmail = google.gmail({ version: "v1", auth: oAuthClient });

// defining tools
export const fetchEmail = tool(async() => {

 

    // TODO: actually fetch do here

    console.log("Fetch Email node invoked")
    // getting the message id first 

    const ListUnReadMsg = await gmail.users.messages.list({
        userId: "me",
         q: "is:unread category:primary -category:promotions -category:social",
        maxResults: 5
    })

    // console.log("ListUnreadMessages Gott" , ListUnReadMsg)


    const MessageId = ListUnReadMsg?.data?.messages

    if (!MessageId) {
      throw new Error("No unread messages found.");   
    }

    
  // Fetch the full message using that ID
  
  // .map() fires them all at once. Promise.all() only waits for them to finish other wise without Promise 
  // the map function will split out only [Promise] , [Promuise]
  const AllMessageIds = await Promise.all(
    // using {} this to only get the id not the id object
  MessageId.map(async ({ id }) => {
    const Msg = gmail.users.messages.get({
      userId: "me",
      id,         
      format: "full",
    });
    return Msg;
  })
)
//   console.log("All MessageIds" , AllMessageIds)

  const MessagePayloadInfo = AllMessageIds.map((singlepayload) => singlepayload.data.payload?.headers)
const Body = AllMessageIds.map((singleBody) => singleBody.data.payload?.parts?.map((singleBodyy) => singleBodyy.body))


// this messasgePayload is an array inside array 
const emailsInfo = MessagePayloadInfo.map((headers: any) => {
  const subject = headers.find((h: any) => h.name === "Subject")?.value;
  const from = headers.find((h: any) => h.name === "From")?.value;
  return { subject, from };
});


const subject = emailsInfo.map((h) => h.subject)
const from = emailsInfo.map((h) => h.from) 
  
   // THIS HEADERS CONTAINS ALL THE DATA THAT IS NEEDED SUBJECT , FROM , BODY

//   console.log(  "Message from the fetch" , Msg) 

//   console.log("Headers" ,  Msg.data.payload?.headers)
// //   console.log("Body" , Msg.data.payload?.body)

//   const Headers = Msg.data.payload?.headers

  
//   const subject = Headers?.find((h) => h.name === 'Subject')?.value
//   const From = Headers?.find((h) => h.name === 'From')?.value 

//   // decoding the body
  const zippedBody = Body || ""
  // unzipped the body using the Buffer which decodes it
  const unzippBody = Buffer.from(zippedBody, "base64").toString('utf-8')
  
 return {
     subject: subject,
     from: from,
     body: unzippBody,
 }
}, {
    name: "Fetch_Email",
   description: "Fetch the email",
   schema: z.object({})
})
