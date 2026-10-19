import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { END,  MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";;
import { NextResponse , NextRequest } from "next/server";
import {google} from 'googleapis'
import { MemorySaver } from "@langchain/langgraph";
import Memory from "@/Models/Memory";
import dbconnect from "@/lib/DbConnect";
// tools
import { fetchEmail } from "@/lib/tools/Emails/Fetch-Email";
import { SendEmail } from "@/lib/tools/Emails/Send-Email";
import { Fetch_Events } from "@/lib/tools/Events/Fetch-events";
import { CreateEvent } from "@/lib/tools/Events/Create-Events";
import { Fetch_Birthday } from "@/lib/tools/birthday/fetch-birthdays";
import { Send_BirthDay_wish_On_Whatapp } from "@/lib/tools/birthday/Send-birthday-wish";
import { SendNotfiCationOnPhone } from "@/lib/tools/Phone/Send-Notification-on-phone";
import { BirthdayToolNodeCronjob } from "@/lib/tools/Phone/Send-birthday-remainder";
import { SaveMemory } from "@/lib/tools/Memory/Save-Memory";
import { oAuthClient } from "@/lib/google-auth/oauth-client";

 

// Main LLM (openAI)
const llmModel = new ChatOpenAI({ apiKey: process.env.OPENAI_AI_KEY, model: "gpt-4o" });

const state = new StateSchema({
  messages: MessagesValue,
})

// for Calender tool

// for contact tool 
const Contact = google.people({version: 'v1' , auth: oAuthClient})

oAuthClient.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });


// memory saving tool 




const tools = [fetchEmail , SendEmail , Fetch_Events , CreateEvent , Fetch_Birthday , Send_BirthDay_wish_On_Whatapp , SaveMemory , SendNotfiCationOnPhone , BirthdayToolNodeCronjob] // this converts all the zodSchema into Json schema and send it to llm

// tools.map() converts each tool into a [name, tool] pair
    // Object.fromEntries() converts those pairs into an object 
    // because In your toolNode when LLM calls a tool by name, you look it up:
const toolsbyName = Object.fromEntries(tools.map((tool) => [tool.name , tool]))
// ToolsByName has become a object of tools at this point


// telling the model that this tools exists
export const modelWithTools = llmModel.bindTools(tools, {parallel_tool_calls: false})
    

// this is the first llm call (like giving the context what are you about role etc)
const llmCall = async(state:any) => {

  await dbconnect()

  const today = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "full",
  timeStyle: "short",
});

    // console.log("messages value" , MessagesValue)
  
    const memories = await Memory.find({}) 

    // console.log("Memories found " , memories)
const UserContext = memories.map((e) => `- [${e.category}] ${e.fact} , ${e.createdAt.toLocaleString()}`).join("\n");

// console.log("User Context" , UserContext)
    
  const res = await modelWithTools.invoke([
        new SystemMessage(
            `
You are Jarvis, an email assistant of Athashri Keny.
The current date and time is ${today} (IST).



EMAIL RULES
- Use the Fetch_Email tool to read emails.
- Drafting and sending are two separate steps.
- When the user asks to "draft" or "write" a reply, ONLY show the draft in chat.
- Call Send_Email only after you have shown a draft AND the user's next message
  explicitly says to send it (e.g. "send it", "yes send").
- A request to draft is never permission to send.

MEMORY RULES
- You have a Save_Memory tool. Call it automatically, without being asked,
  when the user shares a lasting fact or preference about themselves
  (likes, dislikes, goals, habits, important people, important dates).
- Do NOT save small talk, one-off requests, or passwords and other secrets.
- Do NOT save the contents of emails you fetched. Only save what the user
  says about themselves.
- After calling Save_Memory, confirm in one short sentence. Never say you
  saved something unless the tool call actually succeeded.

Memory examples:
- "I love chocolates" -> Save_Memory("User loves chocolates")
- "My sister's birthday is June 5" -> Save_Memory("Sister's birthday is June 5")
- "Check my latest email" -> do not save, just use Fetch_Email
- "ok thanks" -> do not save


the Context about the user ${UserContext}
`
        ),
        ...state.messages,  // giving all the full conversation history
    ])

    return {
        messages: [res],
        llmCalls: 1
    }

}

const shouldContinue = (state: any) => {

    const lastMessage = state.messages.at(-1) // this grabs the last message

    // console.log("State " , state )

    // console.log("last message" , lastMessage)


    // Check if it's an AIMessage before accessing tool_calls
  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return END;
  }

  // If the LLM makes a tool call, then perform an action
  if (lastMessage.tool_calls?.length) {
    console.log("tool node requested my llm")
    return "ToolNode";
  }

  // Otherwise, we stop (reply to the user)
  return END;
}


// tool node (its decides and gives agent which are able tool and which to call)
const toolNode = async(state:any) => {

    console.log("Tool node invoked")

   const lastMessage = state.messages.at(-1); // state.messages have all the responses andd toolcalls needed

        // if it is not from ai message then return nothing 
        if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
        return { messages: [] };
    }

    const results = []

    console.log("Numbeer of Tools requested by the llm" , lastMessage.tool_calls?.length)

  // looping through the toolcalls to call the a singal tool 
    for(const toolCall of lastMessage.tool_calls ?? []) {

        // looking for the which tool to call fetching it by name (accessing it)
        const tool = toolsbyName[toolCall.name] as any // this contains the whole tool

    //   console.log("tooolcall" , toolCall)
     

  // calling the tool
  // here the observation means what to the tool returned
        const observation = await tool.invoke(toolCall)

        results.push(observation)

    }
    
    return {messages: results}
}

// console.log(MessagesValue.reducer)


//
// its like a checkpoint like a video game that saves the conversation of prevous
const checkpointer = new MemorySaver()



export const agent: any = new StateGraph(state)
.addNode("llmCall" , llmCall)
.addNode("ToolNode" , toolNode)
.addEdge(START , "llmCall")
.addConditionalEdges('llmCall' , shouldContinue , ['ToolNode' , END])
.addEdge('ToolNode' , 'llmCall')
.compile({checkpointer}) // this passing the checkpointer attaches saves system to the graph





export async function POST(req: NextRequest) {
    

    try {
        

    const {message} = await req.json()

    console.log("Message recevied from frontend" , message)


    // this Readble Stream always required the data in bytes not in string
    const stream: any = new ReadableStream({

        async start(controller) {

            const encoder = new TextEncoder() // // converts string → bytes, required for HTTP responses

              // this awaits (pauses) for the next message(word) to stream word by word  
          for await(const [MessageChunk , metadata] of await agent.stream(
        {messages: new HumanMessage(message)},  
        {
            streamMode: "messages",
            // giving the chat therad_id 
             configurable: {thread_id: '1'}, 
        })
    )
    // NOTE: here the  MessageChunk is a instance of AIMessageChunk (reply from the ai)
    // getType is a function inside every class object (of langgraph) that returuns a string which defines what type of message it is

if (MessageChunk.getType() === 'ai') {
        // console.log("MessageChunkk" , messageChunk)
        controller.enqueue(encoder.encode(MessageChunk.content)) // this is converts into numbers (ASCII value) and pushing the each word immediately
      }
    
    // closing the controller 
    controller.close()
}
})
   return new NextResponse(stream, {
  headers: {"Content-Type": "text/plain; charset=utf-8"}
})


    } catch (error) {
        console.log("Error while running the agent" , error)
        return NextResponse.json({
            message: "Erro while runnung the agnet"
        } , {status: 500})
    }

}