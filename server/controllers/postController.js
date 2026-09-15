import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, post_type } = req.body
        const images = req.files
        let image_urls = []
        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path)
                     const response = await imagekit.upload({
                file: fileBuffer,
                         fileName: image.originalname,
                folder:'posts'
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    {width:'1280'}
                ]
            })
                    return url
                })
            )
        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        res.json({success:true, message:'post created successfully'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 })
        res.json({success:true, posts})
    } catch (error) {
       console.log(error)
        res.json({success:false, message:error.message})
    }
}
export const likePost = async (req, res) => {
    try {
        const {userId}= req.auth()
        const { postId } = req.body
        const post = await Post.findById(postId)
        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            res.json({success:true, message:'post unliked'})
        } else {
            post.likes_count.push(userId)
            await post.save()
            res.json({success:true, message:'post liked'})
        }
    } catch (error) {
        console.log(error)
         res.json({success:false, message:error.message})
    }
}





import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Message from '../models/Message.js'
const connections = {}


// import { createAlert } from '../utils/createAlert.js'
// export const sightingEvents = new EventEmitter()
// sightingEvents.on('sighting-added', createAlert)

export const sseController = (req, res) => {
    const { userId } = req.params
    //   console.log('new client connected', userId)
    //   res.set('content-type', 'text/event-stream')
    //   res.set('Cache-Control', 'no-cache')
    //   res.set('Connection', 'keep-alive')
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    connections[userId] = res
    res.write('log: connected to stream chat\n\n')
    req.on('close', () => {
        delete connections[userId]
        console.log('client disconnected')
    })
}
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { to_user_id, text } = req.body
        const image = req.file
        let media_url = ''
        let message_type = image ? 'image' : 'text'
        if (message_type === 'image') {
            const fileBuffer = fs.readFileSync(image.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName:image.originalname
            })
            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality:'auto'},
                    {format:'webp'},
                    {width:'1280'}
                ]
            })
        }
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        })
        res.json({ success: true, message })
        const messageWithUserData = await Message.findById(message._id).populate('from_user_id')
        if (connections[to_user_id]) {
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
        }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}
export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { to_user_id } = req.body
        const messages = await Message.find({
            $or: [
                {from_user_id:userId, to_user_id},
                {from_user_id:to_user_id, to_user_id:userId},
            ]
        }).sort({ createdAt: -1 })
        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true })
        res.json({success:true, messages})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}
export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const messages = await Message.find({ to_user_id: userId }).populate('from_user_id to_user_id').sort({ createdAt: -1 })
        res.json({success:true, messages})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}