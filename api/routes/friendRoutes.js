import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/request/:userId", async (req, res) => {
    try {
        const requestingUserId = req.user._id;
        const targetUserId = req.params.userId;
        if(requestingUserId.toString() === targetUserId){
            return res.status(400).json({
                success: false,
                message: "You cannot add yourself as a friend"
            })
        }
        const targetUser = await User.findById(targetUserId);
        if(!targetUser){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        if(targetUser.friends.includes(requestingUserId)){
            return res.status(400).json({
                success: false,
                message: "You are already friends with this user"
            })
        }
        const existingRequest = targetUser.friendRequest.find((req) => req.from.toString() === requestingUserId.toString());
        if(existingRequest){
            return res.status(400).json({
                success: false,
                message: "You have already sent a friend request to this user"
            })
        }
        targetUser.friendRequest.push({from: requestingUserId});
        await targetUser.save();
        res.status(200).json({
            success: true,
            message: "Friend request sent successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.put("/request/:requestId", async (req, res) => {
    try {
        const {requestId} = req.params;
        const {action} = req.body;
        const currentUserId = req.user._id;
        const currentUser = await User.findById(currentUserId);
        const friendRequest = currentUser.friendRequest.id(requestId);
        if(!friendRequest){
            return res.status(400).json({
                success: false,
                message: "Friend request not found"
            })
        }
        if(action === "accept"){
            currentUser.friends.push(friendRequest.from);
            currentUser.friendRequest.pull(friendRequest);    
        }else if(action === "reject"){
            currentUser.friendRequest.pull(friendRequest);
        }
        await currentUser.save();
        res.status(200).json({
            success: true,
            message: "Friend request processed successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.get("/recommendations", async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id).populate("friends").populate("friendRequest.from");
        const excludeIds = [
            currentUser._id,
            ...currentUser.friends.map((friend) => friend._id),
            ...currentUser.friendRequest.map((request) => request.from._id)
        ]
        const recommendations = await User.aggregate([
            {
                $match: {
                    _id: {
                        $nin: excludeIds
                    }
                }
            },
            { $lookup: {
                from: 'users',
                let: { userFriends: '$friends' },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $in: ['$_id', currentUser.friends.map(f => f._id)] },
                                { $in: ['$_id', '$$userFriends'] }
                            ]
                        }
                    }
                }],
                as: 'mutualFriends'
            }},
            { $addFields: {
                mutualFriendsCount: { $size: '$mutualFriends' }
            }},
            { $sort: { 
                mutualFriendsCount: -1 
            }}
        ])
        res.status(200).json({
            success: true,
            recommendations
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

export default router;