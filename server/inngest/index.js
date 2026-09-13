import { Inngest } from 'inngest'
import User from '../models/User.js'
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
            user
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

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion]













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