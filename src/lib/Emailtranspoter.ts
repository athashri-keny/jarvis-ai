import transpoter from "./nodeMailter";


export async function SendAIEmail(Mailto: string , body: string , subject: string) {

     console.log("MailTo" , Mailto)
     console.log("body" , body)
console.log("subject" , subject)

    try {
     await transpoter.sendMail({
    from: '"athashri Keny" <athashrikeny38@gmail.com>', // sender address
    to: Mailto, // list of recipients
    subject: subject, // subject line
    text: body, // plain text body
    // html: "<b>Hello world?</b>", // HTML body
  });
  console.log("Send email succcessffully")
    } catch (error) {
        console.log("error while sendig the email" , error)
    }
}