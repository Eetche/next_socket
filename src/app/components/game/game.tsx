import styles from "./game.module.css"
import { socket } from "@/app/api/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Game(props : any) {
    const params = useParams()

    const [allWords, setAllWords] = useState<string[]>([])

    const [usedWordsState, setUsedWordsState] = useState<string[]>([])
    
    
    useEffect(() => {
        socket.emit("read_words", params.slug)

        socket.on("success_read", (words) => {
            setAllWords(words)
        })

        socket.on("get_random_word", (roomArr) => {
            console.log(roomArr)
            setUsedWordsState(roomArr)
        })


    }, [])

    async function nextHand() {
 

        socket.emit("random_word", params.slug)
    }


    return (
        <div className={styles.game} style={{ display: props.display }}>
            <div className={styles.playbar}>
                <p>{usedWordsState}</p>
                <button className={styles.nextBtn} onClick={nextHand}>Дальше</button>
            </div>
        </div>
    )
}