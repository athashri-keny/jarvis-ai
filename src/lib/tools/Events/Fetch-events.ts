
import { oAuthClient } from "@/lib/google-auth/oauth-client"
import { tool } from "@langchain/core/tools"
import { google } from "googleapis"
import z from "zod"

const Calender = google.calendar({version: 'v3' , auth: oAuthClient})
    
// this tool is only for fetching the Upcoming events 
  export const Fetch_Events = tool(async({}) => {

  // Tokens you saved after the user logged in
    

  const events: any = await Calender.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime',
    eventTypes: ['default ']// add further tools if needed
  })

  console.log("events " , events.data.items)

  const AllUpcomingEvents = events.data.items?.map((e: any) =>  ({
    title: e.summary,
    StartDate: e.start?.dateTime ?? e.start?.date,
    // EndDate: e.end?.dateTime ?? e.end?.date,
    location: e.location,
    // description: e.description
  }))

    return {AllUpcomingEvents}
  } , {
    name: "Fetch_Events",
    description: "Fetch the events (not birhtdays) from the google calender",
    schema: z.object({}) // Input parameters
  })


  