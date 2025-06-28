import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
// import { json } from "express";
import jwt from "jsonwebtoken";

// export const Register = async (req,res)=>{
//     try{
//         const{name,username,email,password}=req.body;
//         if( !name || !username || !email || !password){
//             return res.status(400).json({
//                 message:"All fields are required.",
//                 success:false
//             });
//         }
//         const hashedPassword = await bcryptjs.hash(password,16);
//         await User.create({
//             name,
//             username,
//             email,
//             password:hashedPassword
//         });

//         return res.status(201).json({
//             message:"Account created successfully.",
//             success:true
//         });

//     } catch(error){
//         console.error(error);
//         res.status(500).json({
//             message:"Server error",
//             success:false

//         });
//     }
// };
export const Register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    // Check for existing email
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        message: "Email or username already in use.",
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 16);

    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
 } catch (error) {
    console.error("Register Error:", error);

    // Handle duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue)[0];
        return res.status(409).json({
            message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already in use.`,
            success: false
        });
    }

    res.status(500).json({
        message: "Server error",
        success: false
    });
}

};

export const Login = async (req,res) => {
    try{
        const{ email,password} = req.body;
        if(!email  || !password){
            return res.status(401).json({
                message: "All fields are required.",
                success: false
            })
        };
        const user = await User.findOne({email});
        if (!user){
            return res.status(401).json({
                message:"Incorrect email or password",
                success: false
            })
        }
        const inMathch = await bcryptjs.compare(password,user.password);
        if (!inMathch){
            return res.status(401).json({
                message: "Incorect email or password",
                success:false
            });
        }
        const tokenData ={
            userId: user._id
        }
        const token = await jwt.sign(tokenData,process.env.TOKEN_SECRET,{ expiresIn:"1d"});

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV == 'production',
            sameSite:"None",
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(201).cookie("token",token,{ expiresIn:"1d", httpOnly:true}).json({
            message:`Welcom back ${user.name}`,
            user,
            success:true
        })
    }catch(error){
        console.log(error);
    }
}
export const Logout = (req,res)=> {
    return res.cookie("token","" ,{ expiresIn: new Date(Date.now())}).json({
        message:"user logged out successfully.",
        success:true
    })
}
// export const bookmark = async (req, res) => {
//     try {
//         const loggedInUserId = req.body.id;
//         const tweetId = req.params.id;
//         const user = await User.findById(loggedInUserId);
//         if (user.bookmark.includes(tweetId)) {
//             // remove
//             await User.findByIdAndUpdate(loggedInUserId, { $pull: { bookmark: tweetId } });
//             return res.status(200).json({
//                 message: "Removed from bookmark."
//             });
//         } else {
//             // bookmark
//             await User.findByIdAndUpdate(loggedInUserId, { $push: { bookmarks: tweetId } });
//             return res.status(200).json({
//                 message: "Saved to bookmarks."
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };
 
export const bookmark = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const tweetId = req.params.id;

        const user = await User.findById(loggedInUserId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure the bookmarks field exists
        const bookmarks = user.bookmarks || [];

        if (bookmarks.includes(tweetId)) {
            // Remove from bookmarks
            await User.findByIdAndUpdate(loggedInUserId, { $pull: { bookmarks: tweetId } });
            return res.status(200).json({ message: "Removed from bookmarks." });
        } else {
            // Add to bookmarks
            await User.findByIdAndUpdate(loggedInUserId, { $push: { bookmarks: tweetId } });
            return res.status(200).json({ message: "Saved to bookmarks." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select("-password");
        return res.status(200).json({
            user,
        })
    } catch (error) {
        console.log(error);
    }
};
 
export const getOtherUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const otherUsers = await User.find({ _id: { $ne: id } }).select("-password");
        if (!otherUsers) {
            return res.status(401).json({
                message: "Currently do not have any users."
            })
        };
        return res.status(200).json({
            otherUsers
        })
    } catch (error) {
        console.log(error);
    }
}
 
export const follow = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const userId = req.params.id;
        const loggedInUser = await User.findById(loggedInUserId);//patel
        const user = await User.findById(userId);//keshav
        if (!user.followers.includes(loggedInUserId)) {
            await user.updateOne({ $push: { followers: loggedInUserId } });
            await loggedInUser.updateOne({ $push: { following: userId } });
        } else {
            return res.status(400).json({
                message: `User already followed to ${user.name}`
            })
        };
        return res.status(200).json({
            message: `${loggedInUser.name} just follow to ${user.name}`,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const unfollow = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const userId = req.params.id;
        const loggedInUser = await User.findById(loggedInUserId);//patel
        const user = await User.findById(userId);//keshav
        if (loggedInUser.following.includes(userId)) {
            await user.updateOne({ $pull: { followers: loggedInUserId } });
            await loggedInUser.updateOne({ $pull: { following: userId } });
        } else {
            return res.status(400).json({
                message: `User has not followed yet`
            })
        };
        return res.status(200).json({
            message: `${loggedInUser.name} unfollow to ${user.name}`,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}