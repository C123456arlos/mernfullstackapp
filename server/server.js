import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./configs/db.js"
import dns from "node:dns/promises"
import { inngest, functions } from './inngest/index.js'
import {serve} from 'inngest/express'
const app = express()
dns.setServers(["1.1.1.1"])
await connectDB()
app.use(express.json())
app.use(cors())
app.get('/', (req, res) => res.send('server is running'))
app.use('/api/inngest', serve({ client: inngest, functions }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`server is running on port ${PORT}`))

// adjv react




// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config'
// import multer from 'multer'
// import connectDB from './config/db.js'
// import authRouter from './routes/authRoutes.js'
// import employeesRouter from './routes/employeeRoutes.js'
// import profileRouter from './routes/profileRoutes.js'
// import attendanceRouter from './routes/attendanceRoutes.js'
// import dns from "node:dns/promises"
// import leaveRouter from './routes/leaveRoutes.js'
// import payslipRouter from './routes/payslipsRoute.js'
// import dashboardRouter from './routes/dashboardRoutes.js'
// import { serve } from 'inngest/express'
// import {inngest, functions} from './inngest/index.js'

// const app = express()
// const PORT = process.env.PORT || 4000
// app.use(cors())
// app.use(express.json())
// app.use(multer().none())
// app.get('/', (req, res) => res.send('server is running'))
// app.use('/api/auth', authRouter)
// app.use('/api/employees', employeesRouter)
// app.use('/api/profile', profileRouter)
// app.use('/api/attendance', attendanceRouter)
// app.use('/api/leave', leaveRouter)
// app.use('/api/payslips', payslipRouter)
// app.use('/api/dashboard', dashboardRouter)
// app.use('/api/inngest', serve({client:inngest, functions}))
//     dns.setServers(["1.1.1.1"]);
// await connectDB()
// app.listen(PORT, () => console.log(`server running on port ${PORT}`))