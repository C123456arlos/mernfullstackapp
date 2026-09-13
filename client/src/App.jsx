import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import {useUser} from '@clerk/clerk-react'
import Layout from './pages/Layout'
import {Toaster} from 'react-hot-toast'
const App = () => {
  const {user}= useUser()
  return (
    <>
      <Toaster></Toaster>
      <Routes>
        <Route path='/' element={!user?  <Login></Login> :<Layout></Layout>}>
    <Route index element={<Feed></Feed>}></Route>
    <Route path='messages' element={<Messages></Messages>}></Route>
    <Route path='messages/:userId' element={<ChatBox></ChatBox>}></Route>
    <Route path='connections' element={<Connections></Connections>}></Route>
    <Route path='discover' element={<Discover></Discover>}></Route>
    <Route path='profile' element={<Profile></Profile>}></Route>
    <Route path='profile/:profileId' element={<Profile></Profile>}></Route>
    <Route path='create-post' element={<CreatePost></CreatePost>}></Route>
        </Route>
      </Routes>
    </>
  )
}

export default App