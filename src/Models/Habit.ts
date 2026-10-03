// this is a defincation of the habit like which habit eg coding , gym etc


import moongoose , {Schema , models} from 'mongoose'


export interface Habit extends Document{
    name: string,
    duration: number, // for much time,
    Date: Date
} 


const HabitSchema = new Schema<Habit>({
    name: {
      type: String,
      required: true,
      unique: true
    },
    duration: {
        type: Number,
        required: true
    },
    Date: {
        type: Date,
        required: true,
        unique: true
    }
} , {timestamps: true})



export const HabitModel = (moongoose.models.Habit || moongoose.model<Habit>("Habit" , HabitSchema))
   




