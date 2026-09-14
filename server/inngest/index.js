import { Inngest } from 'inngest'
import User from '../models/User.js'
import Connection from '../models/Connection.js'
import sendEmail from '../configs/nodemailer.js'
import Story from '../models/Story.js'
import Message from '../models/Message.js'
export const inngest = new Inngest({ id: 'new-app' })
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        let username = email_addresses[0].email_address.split('@')[0]
        const user = await User.findOne({ username })
        if (user) {
            username = username + Math.floor(Math.random() * 10000)
        }
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + ' ' + last_name,
            profile_picture: image_url,
            username:username
        }
        await User.create(userData)
    }
)
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const updateUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + ' ' + last_name,
            profile_picture: image_url
        }
        await User.findByIdAndUpdate(id, updateUserData)
    }
)
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: 'send-new-connection-request-reminder' },
    { event: 'app/connection-request' },
    async ({event, step}) => {
        const { connectionId } = event.data
        await step.run('send-connection-request-email', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')
            const subject = `new connection request`
            const body = `
            <div style='font-family:Arial, sans-serif; padding:20px;'>
            <h2> hi ${connection.to_user_id.full_name} </h2>
            <p>you have a new connection request from ${connection.from_user_id.full_name} -@{conenction.from_user_id.username}</p>
            <p>click <a href-'${process.env.FRONTEND_URL}/connections' style='color:#10b981;'>here</a>to accept or reject the request</p>
            <br/>
            <p>thanks <br/> mern app stay connected</p>
            </div>
         `
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
        })
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil('wait-for-24-hours', in24Hours)
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')
            if (connection.status === 'accepted') {
                return {messge:'already accepted'}
            }
            const subject = `new connection request`
            const body = `
            <div style='font-family:Arial, sans-serif; padding:20px;'>
            <h2> hi ${connection.to_user_id.full_name} </h2>
            <p>you have a new connection request from ${connection.from_user_id.full_name} -@{conenction.from_user_id.username}</p>
            <p>click <a href-'${process.env.FRONTEND_URL}/connections' style='color:#10b981;'>here</a>to accept or reject the request</p>
            <br/>
            <p>thanks <br/> mern app stay connected</p>
            </div>
         `
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
            return {message:'reminder sent'}
        })
    }
)
const deleteStory = inngest.createFunction(
    { id: 'story-delete' },
    { event: 'app/story.delete' },
    async ({ event, step }) => {
        const { storyId } = event.data
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil('wait-for-24-hours', in24Hours)
        await step.run('delete-story', async () => {
            await Story.findByIdAndDelete(storyId)
            return {message:'story deleted'}
        })
    }
)
const sendNotificationsOfUnseenMessages = inngest.createFunction(
    { id: 'send-unseen-messages-notification' },
    { cron: 'TZ=America/New_York 0 9 * * *' },
    async ({step }) => {
        const messages = await Message.find({ seen: false }).populate('to_user_id')
        const unseenCount = {}
        messages.map(message => {
            unseenCount[message.to_user_id]= (unseenCount[message.to_user_id._id] ||0)+1
        })
        for (const userId in unseenCount) {
            const user = await User.findById(userId)
            const subject = `you have ${unseenCount[userId]} unseen messages`
            const body = `
            <div style='font-family:Arial, sans-serif; padding:20px;>
            <h2>hi ${user.full_name}</h2>
            <p>you have ${unseenCount[userId]} unseen messages</p>
            <p>click <a href='${process.env.FRONTEND_URL}/messages' style='color:#10b981;'>here</a>
            to view them</p>
            <br/>
            <p>thanks </br> mern app stay connected</p>
            </div>
            `
            await sendEmail({
                to: user.email, 
                subject,
            body
        })
        }
        return {message:'notification sent'}
    }
)
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion, sendNewConnectionRequestReminder, 
    deleteStory, sendNotificationsOfUnseenMessages
]













// import { Inngest } from 'inngest'
// import { connectDB } from './db.js'
// import User from '../models/User.js'
// import { deleteStreamUser, upsertStreamUser } from './stream.js'

// export const inngest = new Inngest({ id: 'my-app' })
// const syncUser = inngest.createFunction(
//     { id: 'sync-user' },
//     { event: 'clerk/user.created' },
//     async ({ event }) => {
//         await connectDB()
//         const { id, email_addresses, first_name, last_name, image_url } = event.data
//         const newUser = {
//             clerkId: id,
//             email: email_addresses[0]?.email_address,
//             name: `${first_name || ''} ${last_name || ''}`,
//             profileImage:image_url
//         }
//         await User.create(newUser)
//         await upsertStreamUser({
//             id: newUser.clerkId.toString(),
//             name: newUser.name,
//             image:newUser.profileImage
//         })
//     }
// )
// const deleteUserFromDB = inngest.createFunction(
//     { id: 'delete-user-from-db' },
//     { event: 'clerk/user.deleted' },
//     async ({ event }) => {
//         await connectDB()
//         const { id } = event.data
//         await User.deleteOne({ clerkId: id })
//         await deleteStreamUser(id.toString())
//     }
// )
// export const functions= [syncUser, deleteUserFromDB]







// import { Inngest } from 'inngest'
// import User from '../models/User.js'
// export const inngest = new Inngest({ id: 'new-app' })
// const syncUserCreation = inngest.createFunction(
//     { id: 'sync-user-from-clerk' , triggers:[{ event: 'clerk/user.created' }]},
//     //  { id: 'auto-check-out' , triggers:[{ event: 'employee/check-out' }]},
//     async ({ event }) => {
//         const { id, first_name, last_name, email_addresses, image_url } = event.data
//         let username = email_addresses[0].email_address.split('@')[0]
//         const user = await User.findOne({ username })
//         if (user) {
//             username = username + Math.floor(Math.random() * 10000)
//         }
//         const userData = {
//             _id: id,
//             email: email_addresses[0].email_address,
//             full_name: first_name + ' ' + last_name,
//             profile_picture: image_url,
//             user
//         }
//         await User.create(userData)
//     }
// )
// const syncUserUpdation = inngest.createFunction(
//     { id: 'update-user-from-clerk', triggers:[{ event: 'clerk/user.updated' }] },
//     async ({ event }) => {
//         const { id, first_name, last_name, email_addresses, image_url } = event.data
//         const updateUserData = {
//             email: email_addresses[0].email_address,
//             full_name: first_name + ' ' + last_name,
//             profile_picture: image_url
//         }
//         await User.findByIdAndUpdate(id, updateUserData)
//     }
// )
// const syncUserDeletion = inngest.createFunction(
//     { id: 'delete-user-from-clerk' , triggers:[{ event: 'clerk/user.deleted' }] },
//     async ({ event }) => {
//         const { id } = event.data
//         await User.findByIdAndDelete(id)
//     }
// )

// export const functions=[syncUserCreation, syncUserUpdation, syncUserDeletion]