import { AIMessage, AIMessageChunk, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { END, interrupt, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";;
import { NextResponse , NextRequest } from "next/server";
import z from "zod";
import {google} from 'googleapis'
import { EmailSchema } from "@/Schemas/EmailSchema";
import { MemorySaver } from "@langchain/langgraph";
import { SendAIEmail } from "@/lib/Emailtranspoter";
 

// Main LLM (openAI)
const llmModel = new ChatOpenAI({ apiKey: process.env.OPENAI_AI_KEY, model: "gpt-4o-mini" });

// define state
const state = new StateSchema({
    messages: MessagesValue // this MessageValue uses reducer function to append the messages instead of override everystate when adding a new message
})

type Email = z.infer<typeof EmailSchema>;


// creating a object of the user using 0auth
export const oAuthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

const gmail = google.gmail({ version: "v1", auth: oAuthClient });

// setting the crendailts of the user(which user to fetch gmails)

oAuthClient.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
})


// defining tools
const fetchEmail = tool(async() => {

    // TODO: actually fetch do here

    console.log("Fetch Email node invoked")
    // getting the message id first 

    const ListUnReadMsg = await gmail.users.messages.list({
        userId: "me",
        q: 'is:unread',
        maxResults: 1 // TODO: write 10 here and loop through the to get each id fetch it
    })


    const MessageId = ListUnReadMsg?.data?.messages?.[0]?.id

    if (!MessageId) {
      throw new Error("No unread messages found.");   
    }

    
  // Fetch the full message using that ID 
  const Msg = await gmail.users.messages.get({
    userId: 'me',
    id: MessageId,
    format: 'full'
  })

   // THIS HEADERS CONTAINS ALL THE DATA THAT IS NEEDED SUBJECT , FROM , BODY

//   console.log(  "Message from the fetch" , Msg) 

//   console.log("Headers" ,  Msg.data.payload?.headers)
// //   console.log("Body" , Msg.data.payload?.body)

  const Headers = Msg.data.payload?.headers

  
  const subject = Headers?.find((h) => h.name === 'Subject')?.value
  const From = Headers?.find((h) => h.name === 'From')?.value 

//   // decoding the body
  const zippedBody = Msg?.data?.payload?.parts?.[0]?.body?.data || ""
  // unzipped the body using the Buffer which decodes it
  const unzippBody = Buffer.from(zippedBody , "base64").toString('utf-8')
  
 return {
     subject: subject,
     from: From,
     body: unzippBody,
 }
}, {
    name: "Fetch_Email",
   description: "Fetch the email",
   schema: z.object({})
})


const SendEmail = tool(async ({body , subject , Mailto}) => {

    
     console.log("MailTo from tool" , Mailto)
     console.log("body from tool" , body)
console.log("subject from tool" , subject)

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




const tools = [fetchEmail , SendEmail]

// tools.map() converts each tool into a [name, tool] pair
    // Object.fromEntries() converts those pairs into an object 
    // because In your toolNode when LLM calls a tool by name, you look it up:
const toolsbyName = Object.fromEntries(tools.map((tool) => [tool.name , tool]))
// ToolsByName has become a object of tools at this point


// telling the model that this tools exists
const modelWithTools = llmModel.bindTools(tools)
    

// this is the first llm call (like giving the context what are you about role etc)
const llmCall = async(state:any) => {

    // console.log("messages value" , MessagesValue)
    
    const res = await modelWithTools.invoke([
        new SystemMessage(
            `You are Javis, an email assistant of athashri keny.
- Use the Fetch_Email tool to read emails.
Drafting and sending are two separate steps.
- When the user asks to "draft" or "write" a reply, ONLY show the draft in chat. Do NOT call Send_Email.
- Call Send_Email only after you have shown a draft AND the user's next message explicitly says to send it (e.g. "send it", "yes send").
- A request to draft is never permission to send.
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


const agent: any = new StateGraph(state)
.addNode("llmCall" , llmCall)
.addNode("ToolNode" , toolNode)
.addEdge(START , "llmCall")
.addConditionalEdges('llmCall' , shouldContinue , ['ToolNode' , END])
.addEdge('ToolNode' , 'llmCall')

.compile({checkpointer}) // this passing the checkpointer attaches saves system to the graph






export async function POST(req: NextRequest) {
    

    try {
        
    // TODO: await dbconnect()

    const {message} = await req.json()

    console.log("Message recevied from frontend" , message)


    // this Readble Stream always required the data in bytes not in string
    const stream: any = new ReadableStream({

        async start(controller) {

            const encoder = new TextEncoder() // // converts string → bytes, required for HTTP responses

              // this awaits (pauses) for the next message(word) to stream word by word  
          for await(const [messageChunk , metadata] of await agent.stream(
        {messages: new HumanMessage(message)},
        {
            streamMode: "messages",
            // giving the chat therad_id 
             configurable: {thread_id: '1'}, 
        })
    )
    // NOTE: here the  MessageChunk is a instance of AIMessageChunk (reply from the ai)
    // getType is a function inside every class object (of langgraph) that returuns a string which defines what type of message it is 
    if (messageChunk.getType() === 'ai') {
        // console.log("MessageChunkk" , messageChunk)
        controller.enqueue(encoder.encode(messageChunk.content)) // this is converts into numbers (ASCII value) and pushing the each word immediately
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