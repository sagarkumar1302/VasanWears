import React from 'react'
import { BrowserRouter,Routes, Route } from 'react-router-dom'
import UserLayout from './components/Layout/UserLayout'

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<UserLayout/>}></Route> //User Layout
      <Route></Route> //Admin Layout
    </Routes>
    </BrowserRouter>
  )
}

export default App
