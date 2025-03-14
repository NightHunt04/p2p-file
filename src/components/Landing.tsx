import BlurText from "../blocks/TextAnimations/BlurText/BlurText"
import ShinyText from "../blocks/TextAnimations/ShinyText/ShinyText"
import FadeContent from "../blocks/Animations/FadeContent/FadeContent"
import { MoveRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface LandingProps {
    peerId: string
}

export default function Landing({ peerId }: LandingProps) {
    const navigate = useNavigate()
    
    const handleReceive = () => {
        if (peerId) navigate(`/receive/${peerId}`)
    }
  return (
    <div className="flex items-center min-h-screen justify-center select-none h-full w-full">
        <div className="relative w-[80%] md:w-[60%] lg:w-[35%] flex items-center justify-center">
            <img src="/assets/main.png" className="w-full h-full shadow-xl brightness-75 animate-hover-img" alt="" />
            <div className="absolute -top-6 md:-top-10 z-20 w-[100vw] flex flex-col items-center justify-center">
                <BlurText
                    delay={150}
                    animateBy="words"
                    direction="bottom"
                    className="text-5xl md:text-9xl font-extrabold"
                    text="Peer2peer" />
                <BlurText
                    delay={120}
                    animateBy="words"
                    direction="bottom"
                    className="text-5xl md:text-9xl font-extrabold -mt-1 md:-mt-3"
                    text="File Transfer" />
                <FadeContent blur={true} className="w-[90%] md:w-[80%]" duration={1000} easing="ease-in-out" initialOpacity={0}>
                    <p className="text-center text-sm w-full md:text-md font-medium mt-3 md:mt-5">Effortless File Transfers, No Middleman – Just You and Your Peers!</p>
                </FadeContent>
                <button onClick={handleReceive} className="hover:cursor-pointer hover:scale-105 transition-all px-3 py-2 rounded-3xl mt-52 border border-[#8a8a8a] shadow-lg bg-[#131313]">
                    <ShinyText
                        text="Receive now"
                        speed={5}
                        className="text-md font-medium"
                    />&nbsp;
                    <MoveRight className="inline-block text-gray-400 w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
    )
}
