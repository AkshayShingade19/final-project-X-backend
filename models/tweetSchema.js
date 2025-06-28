import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    like: {
        type: Array,
        default: []
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    userDetails: {
        type: Array,
        default: []
    }
}, { timestamps: true });

export const Tweet = mongoose.model("Tweet", tweetSchema);









// import mongoose from "mongoose";

// const tweetScheam = new mongoose.Schema({
//     description:{
//         Type:String,
//         required:true
//     },
//     like:{
//         Type:String,
//         default:[]
//     },
//     userId:{
//         Type:mongoose.Schema.Types.ObjectId,
//         ref:"User"
//     },
//     userDetails:{
//         Type:Array,
//         default:[]
//     },
// },{timestamps:true});
// export const Tweet =mongoose.model("Tweet",tweetScheam);