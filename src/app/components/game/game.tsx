import styles from "./game.module.css"
import { socket } from "@/app/api/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/app/api/cookies";
import { useRouter } from "next/navigation";

import Alert from "../alert/alert";

export default function Game(props: any) {
    const params = useParams()

    const [allWords, setAllWords] = useState<string[]>([])

    const [usedWordsState, setUsedWordsState] = useState<string[]>([])

    const [isSpeaker, setIsSpeaker] = useState(false)

    const [nextBtnDisp, setNextBtnDisp] = useState("")
    const [wordsDisp, setWordsDisp] = useState("block")

    const [alertTop, setAlertTop] = useState(-50)
    const [alertText, setAlertText] = useState("")

    const username = getCookie("username")

    const router = useRouter()

    function newAlert(text: string) {

        setAlertTop(0)
        setAlertText(text)

        setTimeout(() => {
            setAlertTop(-50)
        }, 3000)
    }

    useEffect(() => {
        socket.emit("read_words", params.slug)
        console.log("first emits")

        socket.on("success_read", (words) => {
            setAllWords(words)
            socket.emit("get_teams", params.slug)
        })

        socket.on("get_random_word", (data) => {
            const roomArr = data.wordsForRoom
            const Allspeakers = data.Allspeakers as string[]
            const Allguessers = data.Allguessers as string[]

            console.log(roomArr)

            if (Allguessers.includes(username)) {
                roomArr.pop()
            }

            setUsedWordsState(roomArr)
        })

        socket.on("end_game", () => {
            newAlert("Игра окончена. Перенаправление...")
            setTimeout(() => {
                router.replace("/")
            }, 5000)
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


        socket.emit("random_word", {room: params.slug, username: username})
    }


    return (
        <div className={styles.game} style={{ display: props.display }}>
            <Alert top={alertTop} text={alertText} />
            <div className={styles.playbar}>
                <p style={{ display: wordsDisp }}  className={styles.words}>{usedWordsState}</p>
                <button className={styles.nextBtn} onClick={nextHand} style={{ display: nextBtnDisp }}>Дальше</button>
            </div>
        </div>
    )
}