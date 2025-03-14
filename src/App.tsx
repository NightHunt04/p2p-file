import { Route, Routes } from "react-router-dom"
import Landing from "./components/Landing"
import Receiver from "./components/action/Receiver"
import Sender from "./components/action/Sender"
import { useState, useRef, useEffect } from "react"
import Peer from "peerjs"

function App() {
  const peerRef = useRef<Peer | null>(null)
  const [peerId, setPeerId] = useState("")
  useEffect(() => {
      if (!peerRef.current) {
          peerRef.current = new Peer()
          peerRef.current.on("open", (id) => {
              setPeerId(id)
          })
      }
  }, [peerRef])

  return (
    <>
      <div className="w-full font-inter bg-[#1D1D1D] text-white overflow-hidden flex items-start justify-center">
        <Routes>
          <Route path="/" element={<Landing peerId={peerId} />} />
          <Route path="/receive/:id" element={<Receiver peerId={peerId} peerRef={peerRef.current} />} />
          <Route path="/send/:id" element={<Sender peerRef={peerRef.current} />} />
        </Routes>
      </div>
    </>
  )
}

export default App
