import moongoose , {Schema , models} from 'mongoose'



export interface Memory extends Document{
    UserID: string,
    fact: string,
    category: string,
}



const MemorySchema = new Schema<Memory>({
  UserID: {
    type: String,
    required: true
  },
  fact: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['goal' , 'routine' , 'preference' , 'general'],
    default: 'general'
  },
} , {timestamps: true})



export default moongoose.models.Memory || moongoose.model("Memory", MemorySchema)