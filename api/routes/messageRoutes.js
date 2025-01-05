import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/send", protectedRoute, async (req, res) => {
    try {
        const {content, receiver} = req.body;
        const isFriend = await User.friend.includes(receiver);
        if(!isFriend){
            return res.status(400).json({
                success: false,
                message: "You are not friends with this user"
            })
        }   
        const message = new Message({
            content,
            sender: req.user._id,
            receiver
        })
        await message.save();
        res.status(200).json({
            success: true,
            message: message
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.get("/conversation", protectedRoute, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                {sender: req.user._id},
                {receiver: req.user._id}
            ]
        })
        .sort({createdAt: -1})
        .populate("sender").populate("receiver");
        res.status(200).json({
            success: true,
            messages: messages
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

export default router;