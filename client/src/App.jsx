import React, { useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import {useUser, useAuth} from '@clerk/clerk-react'
import Layout from './pages/Layout'
import toast, {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessage } from './features/messages/messagesSlice'
import Notifications from './components/Notifications'
const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const {pathname}= useLocation()
  const pathnameRef= useRef(pathname)
  const dispatch= useDispatch()
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()
  }, [user, getToken, dispatch])
  useEffect(() => {
    pathnameRef.current=pathname
  }, [pathname])
  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id)
      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (pathnameRef.current === ('/messages/' + message.from_user_id._id)) {
          dispatch(addMessage(message))
        } else {
          toast.custom((t) => (
            <Notifications t={t} message={message}></Notifications>
          ), {position:'bottom-right'})
        }
      }
      return () => {
        eventSource.close()
      }
    }
  }, [user, dispatch])
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