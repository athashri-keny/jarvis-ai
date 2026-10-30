import { createAgent } from "langchain";
import { HumanMessage } from '@langchain/core/messages'
import { NextResponse , NextRequest } from 'next/server'
import { Send_BirthDay_wish_On_Whatapp } from "@/lib/tools/birthday/Send-birthday-wish";
import { SendNotfiCationOnPhone } from "@/lib/tools/Phone/Send-Notification-on-phone";
import { BirthdayToolNodeCronjob } from "@/lib/tools/Phone/Send-birthday-remainder";
import { ChatOpenAI } from "@langchain/openai";


export async function POST(req_: NextRequest) {
    try {
        
  const today = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "full",
  timeStyle: "short",
});


console.log(today)

const name = 'Athashri Keny'

const Agent =  createAgent({
     model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
    tools: [SendNotfiCationOnPhone , BirthdayToolNodeCronjob , Send_BirthDay_wish_On_Whatapp],
    systemPrompt: `

   Today is  ${today}
    You are the birthday reminder agent for Athashri Keny.

1. Call Birthday_Tool_for_Cronjob exactly once.
2. If it returns any birthdays, call Send_BirthDay_wish_On_Whatapp once per person
   with a short warm birthday message, and keep the link it returns.
3. Then call SendNotificationonPhone exactly once. The Message you send must be
   plain text, in this format:
   Line 1: "{greeting} (note the greeting must good morning) , Athashri Keny! {weekday and date}"
   Line 2: Tell which person birthday is today then thier wa.link with their WhatsApp links, OR if there are none,
         for eg if there is jhoe doe birthday today then the message format will be 
         Good Morning Athashri Keny {week and date}
         Today is jhoe doe birthday!, i have generated a happy birthday wish for her/him click the (wa.link) to wish them on whatapp!
           or if no birthday today then exactly: No friends birthday Today.
    `
    })

   const res =  await Agent.invoke({
        messages: [new HumanMessage(`Run the todays birthday check`)]
    })

// console.log(res)

     return NextResponse.json({
        res
     } , {status: 200})


    } catch (error) {
        console.log("Error while running the agent" , error)
        return NextResponse.json({
            message: "Error"
        } , {status: 500})
    }
}




