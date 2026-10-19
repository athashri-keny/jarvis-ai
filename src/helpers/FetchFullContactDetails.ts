import { oAuthClient } from "@/lib/google-auth/oauth-client"
import { google } from "googleapis"

// for contact tool 
const Contact = google.people({version: 'v1' , auth: oAuthClient})


// TODO: move this function into Helper function file
export const fetchFullContactDetails = async(contactId : any) => {

  console.log("ContactId found " , contactId)

 const res =  await Contact.people.get({
  resourceName: contactId,
  personFields: 'names,phoneNumbers'
 }) 

//  console.log("Contact Number found " , res.data.phoneNumbers?.map((e) => e.canonicalForm))

 const contactNumber = res.data.phoneNumbers?.map((e) =>  e.canonicalForm)

 console.log("Contact Number found " , contactNumber)

 return contactNumber
}
