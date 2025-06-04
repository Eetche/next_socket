import styles from "./game.module.css"
import { socket } from "@/app/api/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/app/api/cookies";

export default function Game(props : any) {
    const params = useParams()

    const [allWords, setAllWords] = useState<string[]>([])

    const [usedWordsState, setUsedWordsState] = useState<string[]>([])

    const [isSpeaker, setIsSpeaker] = useState(false)

    const [nextBtnDisp, setNextBtnDisp] = useState("")
    const [wordsDisp, setWordsDisp] = useState("block")

    const username = getCookie("username")
    
    useEffect(() => {
        socket.emit("read_words", params.slug)
        console.log("first emits")
        
        socket.on("success_read", (words) => {
            setAllWords(words)
            socket.emit("get_teams", params.slug)
        })

        socket.on("get_random_word", (data) => {
            const roomArr = data.wordsForRoom
            const Allspeakers = data.Allspeakers
            const Allguessers = data.Allguessers

            
            if (!Allspeakers.includes(username)) {

                roomArr.pop()
            }
            console.log(roomArr)

            setUsedWordsState(roomArr)
        })

        socket.on("start_hand", (data) => {

            const speakers = data.speakers
            const guessers = data.guessers
    
            if (speakers.includes(username)) {
                setNextBtnDisp("block")
            } else {
                setNextBtnDisp("none")
            }

            console.log(`is really speaker: ${speakers.includes(username)}`)
        })
    }, [])

    async function nextHand() {

 
        socket.emit("random_word", params.slug, isSpeaker)
    }


    return (
        <div className={styles.game} style={{ display: props.display }}>
            <div className={styles.playbar}>
                <p style={{ display: wordsDisp }}>{usedWordsState}</p>
                <button className={styles.nextBtn} onClick={nextHand} style={{ display: nextBtnDisp }}>Дальше</button>
            </div>
        </div>
    )
}