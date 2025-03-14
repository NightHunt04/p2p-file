import QRCode from "react-qr-code"
import { Link } from "lucide-react"
import ShinyText from "../../blocks/TextAnimations/ShinyText/ShinyText"
import FadeContent from "../../blocks/Animations/FadeContent/FadeContent"
import { useEffect, useRef, useState } from "react"
import { Download, ExternalLink } from "lucide-react"
import Peer from "peerjs"

interface ActionProps {
    peerId: string
    peerRef: Peer | null
}

interface Data {
    filename: string
    filetype: string
    filesize: number
    filedata: ArrayBuffer
}

interface ReceivedFile {
    filename: string
    filesize: number
    url: string
}

export default function Action({ peerId, peerRef }: ActionProps) {
    const [copied, setCopied] = useState(false)
    const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([])
    const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const handleCopyLink = () => {
        window.navigator.clipboard.writeText(`https://p2p-file.vercel.app/send/${peerId}`)
        setCopied(true)
        if (copyTimeout.current) 
            clearTimeout(copyTimeout.current)
        copyTimeout.current = setTimeout(() => {
            setCopied(false)
        }, 3000)
    }

    useEffect(() => {
        if (peerRef) {
            peerRef.on("connection", (conn) => {
                // @ts-ignore
                conn.on("data", (data: Data) => {
                    const blob = new Blob([data.filedata], { type: data.filetype })
                    const url = URL.createObjectURL(blob)

                    setReceivedFiles((prev) => [
                        ...prev,
                        { filename: data.filename, filesize: data.filesize, url },
                    ])
                    conn.send({ ack: data.filename })
                })
                conn.on("close", () => {
                    console.log("Connection closed.")
                })
            })
        }

        return () => {
            peerRef?.off("connection")
        }
    }, [peerRef])
    return (
        <div className="w-full flex select-none min-h-screen flex-col items-center justify-start">
            <div className="w-full flex flex-col items-center justify-center mt-10">
                {receivedFiles.length > 0 &&
                    <div className="w-full flex flex-col items-center justify-center">
                        <div className="w-[90%] md:w-[30%] flex flex-col items-center justify-center gap-1">
                            <p className="text-3xl md:text-4xl font-bold text-center mb-5">Received Files</p>
                            {receivedFiles.map((file, index) => (
                                <div key={index} className="w-full p-3 rounded-xl bg-[#0e0e0e] shadow-lg flex items-start justify-between">
                                    <div className="w-full flex flex-col items-start justify-start">
                                        <p className="text-xs font-medium">{file.filename.length > 20 ? file.filename.slice(0, 20) + "..." : file.filename}</p>
                                        <p className="text-xs text-gray-400">{(file.filesize / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <a title="Download" href={file.url} download className="text-sm font-medium p-2 flex items-center justify-center rounded-lg bg-[#222222]"><Download className="inline-block w-4 h-4 text-green-500" /></a>
                                        <a title="Open in new tab" href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium p-2 flex items-center justify-center rounded-lg bg-[#222222]"><ExternalLink className="inline-block w-4 h-4 text-gray-300" /></a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                {receivedFiles.length === 0 && 
                    <div className="w-full flex flex-col items-center justify-center">
                        <FadeContent blur={true} className="w-full flex items-center justify-center" duration={1000} easing="ease-in-out" initialOpacity={0}>
                            <h2 className="text-4xl md:text-5xl font-bold w-[90%] md:w-[40%] text-center">Receive the file by sharing the link or QR code</h2>
                        </FadeContent>
                        <div className="w-56 md:w-64 bg-white mt-12 md:mt-16 flex items-center justify-center rounded-lg p-2">
                            <QRCode 
                                value={`http://localhost:5173/send/${peerId}`}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                size={256}
                                viewBox="0 0 256 256"
                            />
                        </div>
                        <p className="text-md font-medium my-5">or</p>
                        <button onClick={handleCopyLink} className="px-4 py-3 text-sm font-medium rounded-3xl border border-[#8a8a8a] shadow-lg bg-[#131313] hover:cursor-pointer hover:scale-105 transition-all flex items-center justify-center">
                            <ShinyText
                                text="Copy link"
                                speed={5}
                                className="text-md font-medium"
                            />&nbsp;
                            <Link className="w-4 h-4" />
                        </button>
                        {copied && 
                            <p className="mt-5 text-sm font-medium p-2 rounded-3xl bg-[#0e0e0e] text-green-500">Copied!</p>
                        }
                    </div>}
            </div>
        </div>
    )
}
