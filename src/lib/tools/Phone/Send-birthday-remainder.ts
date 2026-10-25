
import { oAuthClient } from "@/lib/google-auth/oauth-client"
import { tool } from "@langchain/core/tools"
import { google } from "googleapis"
import z from "zod"


// NOTE: this is tool is only for the cronjob (becasue it returns birthdays within 10 days not all)

const Calender = google.calendar({version: 'v3' , auth: oAuthClient})

 export const BirthdayToolNodeCronjob = tool(async({}) => {

console.log("BirthdayToolCronJob invoked")
const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// start of today in IST, and exactly 24 hours later
const startOfToday = new Date(`${todayISO}T00:00:00+05:30`);
const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);


const events: any = await Calender.events.list({
    calendarId: 'primary',
    // timeMin: startOfToday.toISOString(),
    singleEvents: true,
    // timeMax: startOfTomorrow.toISOString(), // 10 days from now 
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
    name: "Birthday_Tool_for_Cronjob",
    description: "Use this tool for only for the cron job for fetching the birthday",
    schema: z.object({})
  }) 