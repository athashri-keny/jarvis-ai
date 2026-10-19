
import { oAuthClient } from "@/lib/google-auth/oauth-client"
import { tool } from "@langchain/core/tools"
import { google } from "googleapis"
import z from "zod"


const Calender = google.calendar({version: 'v3' , auth: oAuthClient})


  // for upcoming birthdays of the frinds
 export const Fetch_Birthday = tool(async({}) => {

    console.log("Fetch Bithday Tool invoked")

const events: any = await Calender.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime',
    eventTypes: ['birthday'] // add further events if needed
  })

console.log("events " , events.data.items)


const AllUpcomingBirthdays = events.data.items?.map((e: any) =>  ({
    title: e.summary,
    StartDate: e.start?.dateTime ?? e.start?.date,
    // EndDate: e.end?.dateTime ?? e.end?.date,
    location: e.location,
    // description: e.description
    ContactId: e.birthdayProperties.contact // for getting the contact details 
  }))
 
  return {AllUpcomingBirthdays}

  } , {
    name: 'Fetch_Birthdays',
    description: "Fetch the birthdays from the google calender (not the events)",
    schema: z.object({})
  })

