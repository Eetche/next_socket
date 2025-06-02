import styles from "./game.module.css"
import { socket } from "@/app/api/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Game(props) {
    const params = useParams()

    const [word, setWord] = useState("")

    
    useEffect(() => {
        socket.emit("read_words", params.slug)
        socket.on("success_read", (words) => {
            const wordsLen = words.length
            const randomWord = Math.floor(Math.random() * (wordsLen + 1));
            setWord(words[randomWord])
        })
    }, [])


    return (
        <div className={styles.game} style={{ display: props.display }}>
            <p>{word}</p>
        </div>
    )
}