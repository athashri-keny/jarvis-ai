
import { oAuthClient } from "@/lib/google-auth/oauth-client"
import { tool } from "@langchain/core/tools"
import { google } from "googleapis"
import z from "zod"


const Calender = google.calendar({version: 'v3' , auth: oAuthClient})

// for creating events 
export const CreateEvent = tool(async({name , description , StartDate , EndTime}) => {


  console.log("Name of the event "  , name)
  console.log("Description of the event "  , description)
  console.log("StartDate " , StartDate)
  console.log("EndTIme"  , EndTime)
  
  // string -> Date here
  const AddEvent = await Calender.events.insert({
  calendarId: 'primary',
  requestBody: {
    summary: name,
    description: description,
    start: {dateTime: StartDate , timeZone: 'Asia/Kolkata'},
    end: {dateTime: EndTime , timeZone: 'Asia/Kolkata'},
  }      
  })

  console.log("Added Event " , AddEvent)

  return {AddEvent}

} , {
  name: "Create_event",
  description: "Create a event in the google calender",
  schema: z.object({
    name: z.string().describe("Name of the event"),
       StartDate: z.string().describe("Start date and time in ISO 8601 format, e.g. 2026-10-05T10:00:00+05:30"),
    description: z.string().describe("Description of the event").optional(),
    EndTime: z.string().describe("Endtime date and time in ISO 8601 format, e.g. 2026-10-05T10:00:00+05:30")
  })
})