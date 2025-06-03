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
        socket.emit("get_teams", params.slug)

        socket.on("success_read", (words) => {
            setAllWords(words)
        })

        socket.on("get_random_word", (roomArr) => {
            setUsedWordsState(roomArr)
            
            if (!isSpeaker) {
                const arrForGuesser = roomArr.pop()
                setUsedWordsState(arrForGuesser)
                console.log(`guesser: ${arrForGuesser}`)
            } else {
                
                console.log(`speaker: ${roomArr}`)
            }
        })

        socket.on("give_teams", (data) => {
            const speakers = data.speakers
            const guessers = data.guessers

            if (speakers.includes(username)) {
                setIsSpeaker(true)
                setNextBtnDisp("block")
            } else {
                setNextBtnDisp("none")
                setIsSpeaker(false)
            }
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