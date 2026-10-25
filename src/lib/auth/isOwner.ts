
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server"



export default  async function IsOwner() {

    console.log("Is owner check function invoked")

    // getting the current user
    const user = await currentUser()

  const {userId} = await auth()

    // console.log( "user" , user)

    if (!user || !userId) {
        return false
    }


    return (
       userId === process.env.OWNER_CLERK_ID
    )
}