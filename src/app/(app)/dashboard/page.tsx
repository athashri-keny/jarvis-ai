"use client"

import { ChatPanel } from '@/components/ChanelPanel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Input } from '@/components/ui/input'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'
import axios from 'axios'
import React, { useState } from 'react'



    type ChatMessage = {
        role: "Human" | 'AI',
        content: string
    }


function Dashboard() {

      const [messages , setmessages] = useState<ChatMessage[]>([]) // Array
      const [input , setinput] = useState("") 

    const chat = async() => {

        const userMessage: ChatMessage = {role: 'Human' , content: input}
      
        // setting all the prevoous messages + the user message
        setmessages((prev) => [...prev , userMessage]) // RE-RENDER
        setinput("")

        try {
          const res = await fetch('/api/javis-chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: userMessage})
    })
    // NOTE: here an the res.body async iterable, NOT an array meaning the word is coming 

            // converting the ASSCI value into the normal string format
            const decode = new TextDecoder()
           
            let result = ""

            // setting the message first empty to catch and update
             setmessages((prev) => [...prev , {role: "AI" , content: ''}])

             // LOOP
            for await (const singleChunk of res.body as any) {
             
              // console.log("Single chunk before decoding" , singleChunk)

              result += decode.decode(singleChunk)

              console.log("Single Chunk from res (after decoding)" , result)

              setmessages((prev) => {
                // taking all the pevious chat 
                const updated = [...prev]
                console.log("ALl the prevoius chat" , ...prev)
                // selecting only the last array of object and upddating it (this keeps updating word by step by step)
                console.log("Length " , updated.length)
                updated[updated.length - 1] = { role: 'AI', content: result }
                return updated
              })
            }
        
        } catch (error) {
            console.log("Error while chatting"  , error)
        }
    }

  return (
   <div className="h-dvh w-full bg-black">
  <ChatPanel
    messages={messages}
    input={input}
    onInputChange={setinput}
    onSend={chat}
    // isLoading={loading}  // optional: pass it if you already track a loading state
  />
</div>
 
  )
}

export default Dashboard