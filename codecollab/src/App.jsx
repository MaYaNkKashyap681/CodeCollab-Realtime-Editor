import { BrowserRouter, Route, Routes } from "react-router-dom"
import Codepage from "./pages/Codepage"
import Homepage from "./pages/Homepage"
import { Toaster } from "react-hot-toast"


function App() {

  return (
    <>
      <div>
        <Toaster position="top-right" />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/code/:roomId" element={<Codepage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
