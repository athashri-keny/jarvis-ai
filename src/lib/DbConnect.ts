import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from "dotenv";


type ConnectionObject = {
    isConnected?: number
}

dotenv.config({ path: ".env" }); // actually load the file



const connection: ConnectionObject = {}



async function dbconnect(): Promise<void> {
    try {
        
        if (connection.isConnected) {
            console.log("Already connected to db")
            return
        }

        
        // console.log("MONODb url" , process.env.MONGODB_URL)
        const db = await mongoose.connect(process.env.MONGODB_URL || "")
        connection.isConnected = db.connections[0].readyState
        console.log("connected to database sucessfully!")

    } catch (error) {
        console.log("Error while connecting to monodb" , error)
        
    }

}


export default dbconnect