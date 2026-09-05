import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { END, interrupt, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { Zen_Tokyo_Zoo } from "next/font/google";
import { NextResponse , NextRequest } from "next/server";
import z from "zod";



// Main LLM (openAI)
const llmModel = new ChatOpenAI({ apiKey: process.env.OPENAI_AI_KEY, model: "gpt-4o-mini" });

// define state
const state = new StateSchema({
    messages: MessagesValue // this MessageValue uses reducer function to append the messages instead of override everystate when adding a new message
})



// defining tools
const fetchEmail = tool(async() => {

    // TODO: actually fetch do here


}, {
    name: "Fetch_Email",
   description: "Fetch the email",
   schema: z.object({})
})

const DraftReplyForEmail = tool(async() => {

    // This section is for auctally work 

} , {
    // parameters required
        name: "Draft_reply_for_email",
    description: "Draft the reply for a email",
    schema: z.object({
        subject: z.string(),
        body: z.string(),
        from: z.string(),
        instructions: z.string().optional(),
    })
})



const tools = [DraftReplyForEmail , fetchEmail]

// tools.map() converts each tool into a [name, tool] pair
    // Object.fromEntries() converts those pairs into an object 
    // because In your toolNode when LLM calls a tool by name, you look it up:
const toolsbyName = Object.fromEntries(tools.map((tool) => [tool.name , tool]))
// ToolsByName has become a object of tools at this point


// telling the model that this tools exists
const modelWithTools = llmModel.bindTools(tools)



// this is the first llm call (like giving the context what are you about)
const llmCall = async(state:any) => {

    const res = await modelWithTools.invoke([
        new SystemMessage(
            `You are a personal assisant of Athashri Keny`
        ),
        ...state.messages   // giving all the full conversation history
    ])

    return {
        messages: [res],
        llmCalls: 1
    }

}

const shouldContinue = (state: any) => {

    const lastMessage = state.messages.at(-1) // this grabs the last message

  // Check if it's an AIMessage before accessing tool_calls
  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return END;
  }

  // If the LLM makes a tool call, then perform an action
  if (lastMessage.tool_calls?.length) {
    return "toolNode";
  }

  // Otherwise, we stop (reply to the user)
  return END;
}


// tool node (its decides and gives agent which are able tool and which to call)
const toolNode = async(state:any) => {

   const lastMessage = state.messages.at(-1); // state.messages have all the responses andd toolcalls needed

        // if it is not from ai message then return nothing 
        if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
        return { messages: [] };
    }

    const results = []

    console.log("Numbeer of Tools requested by the llm" , lastMessage.tool_calls?.length)

  // looping through the toolcalls to call the a singal tool 
    for(const toolCall of lastMessage.tool_calls ?? []) {

        // looking for the which tool to call fetching it by name
        const tool = toolsbyName[toolCall.name] as any // this contains the whole tool

      console.log("Tool" ,tool)
     

  // calling the tool
  // here the observation means what to the tool returned
        const observation = await tool.invoke(toolCall)

        results.push(observation)

    }
    
    return {messages: results}
}


//

const agent = new StateGraph(state)
.addNode("llmCall" , llmCall)
.addNode("ToolNode" , toolNode)
.addEdge(START , "llmCall")
.addConditionalEdges('llmCall' , shouldContinue , ['ToolNode' , END])
.addEdge('ToolNode' , 'llmCall')
.compile()




export async function POST(req: NextRequest) {
    

    try {
        
    // TODO: await dbconnect()

    const {message} = await req.json()

    const resuult = await agent.invoke({
        messages: [new HumanMessage(message)]
    })

    return NextResponse.json({
        reply: resuult
    })


    } catch (error) {
        console.log("Error while running the agent" , error)
        return NextResponse.json({
            message: "Erro while runnung the agnet"
        } , {status: 500})
    }

}