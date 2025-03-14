import Peer from "peerjs"
import { useRef, useState } from "react"
import FadeContent from "../../blocks/Animations/FadeContent/FadeContent"
import { MoveRight, Trash2 } from "lucide-react"
import { useLocation } from "react-router-dom"

interface SenderProps { 
    peerRef: Peer | null
}

export default function Sender({ peerRef }: SenderProps) {
    const location = useLocation()
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [receivedFiles, setReceivedFiles] = useState<string[]>([])
    const [showAck, setShowAck] = useState(false)
    const showAckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        if (event.dataTransfer.files) {
            const files = Array.from(event.dataTransfer.files)
            setFiles(prev => [...prev,  ...files])
            setIsHovered(false)
        }
    }
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            setFiles(prev => [...prev, ...files])
            setIsHovered(false)
        }
    }
    
    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    const handleSendFiles = () => {
        if (files) {
            if (peerRef) {
                setIsUploading(true)
                const conn = peerRef.connect(location.pathname.split("/")[2].trim())
                conn.on('open', () => {
                    files.forEach(file => {
                        const reader = new FileReader()
                        reader.onload = () => {
                            const fileData = {
                                filename: file.name,
                                filetype: file.type,
                                filesize: file.size,
                                filedata: reader.result
                            } 
                            conn.send(fileData)
                        }
                        reader.readAsArrayBuffer(file)
                    })
                    conn.on('data', (data) => {
                        console.log(data)
                        // @ts-ignore
                        setReceivedFiles(prev => [data.ack, ...prev])
                        // @ts-ignore
                        setFiles(prev => prev.filter(file => file.name !== data.ack))
                        setShowAck(true)
                        if (showAckTimeout.current) clearTimeout(showAckTimeout.current)
                        showAckTimeout.current = setTimeout(() => setShowAck(false), 3000)
                    })
                })
                setIsUploading(false)
                conn.on('close', () => {
                    console.log('close')
                    setIsUploading(false)
                })
            }
        }
    }

    return (
        <div className="w-full relative flex select-none min-h-screen flex-col items-center justify-start">
            {isUploading &&
                <div className="fixed w-full z-30 h-screen inset-0 bg-[#0a0a0ac2] flex items-center justify-center">
                    <div className="flex items-center justify-center">
                        <p>Sending to the receiver...</p>
                    </div>
                </div>}  
            {showAck &&
                <div className="absolute bottom-10 rounded-lg z-30 shadow-lg bg-[#131313] p-3 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <p className="font-medium mb-1 text-green-500">File sent successfully!</p>
                        {receivedFiles.map(file => (
                            <p className="text-xs text-gray-300" key={file}>{file}</p>
                        ))}
                    </div>
                </div>}
            <div className="w-full flex flex-col items-center justify-center mt-10">
                <FadeContent blur={true} className="w-full flex items-center justify-center" duration={1000} easing="ease-in-out" initialOpacity={0}>
                    <h2 className="text-4xl md:text-5xl font-bold w-[90%] md:w-[40%] text-center">You are a sender, send the file by dropping it below</h2>
                </FadeContent>
                <div
                    onClick={openFileDialog}
                    onDrop={handleDrop}
                    onDragEnter={() => setIsHovered(true)}
                    onDragLeave={() => setIsHovered(false)}
                    onDragEnd={() => setIsHovered(false)}
                    onDragOver={(e) => e.preventDefault()}
                    className={`w-[90%] md:w-[30%] h-22 md:h-36 mt-10 rounded-xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer transition-all ease-in-out duration-200 ${isHovered ? "bg-gray-100" : ""}`}
                >
                    <p className="text-lg font-semibold">Drag & Drop or Click to Upload</p>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                {files.length > 0 &&
                    <button onClick={handleSendFiles} className="w-[90%] md:w-[30%] mt-10 p-2 flex items-center justify-center rounded-xl shadow-lg border border-green-800 bg-[#131313] hover:cursor-pointer hover:opacity-70 transition-all">
                        Send
                        &nbsp;<MoveRight className="inline-block w-5 h-5" />
                    </button>}
                {files.length > 0 && (
                    <div className="w-[90%] md:w-[30%] mt-2">
                        <div className="flex flex-col gap-1 items-center justify-center w-full">
                            {files.map((file, index) => (
                                <div key={index} className="flex w-full items-center justify-between p-2 rounded-xl bg-[#0e0e0e] shadow-lg">
                                    <span className="text-xs text-gray-300">{file.name.length > 20 ? file.name.slice(0, 20) + "..." : file.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</span>
                                        <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} className="p-2 hover:cursor-pointer hover:opacity-70">
                                            <Trash2 className="text-red-600 w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
