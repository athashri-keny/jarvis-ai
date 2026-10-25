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
   Line 2: the birthdays with their WhatsApp links, OR if there are none,
           exactly: No friends birthday Today.
    `
    })

   const res =  await Agent.invoke({
        messages: [new HumanMessage(`Run the todays birthday check`)]
    })

//      const res =  await agent.invoke(
//          {
//       messages: new SystemMessage(`Today is ${today} (IST).

// Call 
// Fetch_Birthdays exactly once.

// A birthday counts only if its StartDate is today or within the next 10 days.
// Ignore every other birthday in the list, even if it is the nearest one.

// If no birthday counts, do not call any other tool and reply only "No birthdays."

// When the ${today} date matches the Birthday date Call the BirthdayToolNodeCronjob tool and write a birthday message wishing happy birthday with the name 
// and provide the wa. link that the toolcall returned Then call the SendNotificationonPhone tool with the following deatils 

// - Line 1: the weekday and date. Wish a user according to time if its morning in ${today} then wish good morning with the ${name} 
// - Line 2: "Today:" followed by each name (leave this line out if nobody today).
// - Line 3: "Coming up:" followed by each name and its date from StartDate, copied exactly with the whatapp link that the Send_BirthDay_wish_On_Whatapp Returned and mention it in message


// Otherwise call SendNotificationonPhone if there are no birthday today exactly once, with plain text, no markdown:
// - Line 1: the weekday and date.
// - Line 2: "Today:" followed by each name (leave this line out if nobody today).
// - Line 3: "Coming up:" followed by each name No birthday today,
//   (leave this line out if nobody is coming up).`
// ),}, {
//              configurable: {thread_id: Date.now().toString()}, 
//             },  
            
//      )

//      console.log(res)

console.log(res)

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




