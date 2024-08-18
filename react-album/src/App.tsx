// import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// import AboutPage from './pages/about'
import IndexPage from './pages/index/index'
import BookmarkPage from "@pages/bookmark/index"

const router = createBrowserRouter([
  { path: "/", index: true, element: <IndexPage /> },
  { path: "/search/:id", element: <IndexPage /> },
  { path: "/bookmark", element: <BookmarkPage /> }
])

const App = () => {
  return <RouterProvider router={router}/>
}

export default App
