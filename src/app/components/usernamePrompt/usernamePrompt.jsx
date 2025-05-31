import styles from "./usernamePrompt.module.css"
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../../api/cookies";

export default function UsernamePrompt() {

    const [usernameVal, setUsernameVal] = useState("")
    const [displayP, setDisplayP] = useState("none")

    const usernameSubmitHandler = () => {
        if (usernameVal) {
            setDisplayP("none")
            setCookie("username", usernameVal);
        }
    };

    useEffect(() => {
        if (getCookie("username")) {
            setDisplayP("none")
        } else {
            setDisplayP("flex")
        }
    }, [])
    
    return (
        <div className={styles.usernamePrompt} style={{ display: displayP }}>
            <input
                type="text"
                className={styles.usernameInput}
                placeholder="Имя пользователя"
                onChange={(e) => setUsernameVal(e.target.value)}
            />
            <input
                type="button"
                value="Подтвердить"
                onClick={usernameSubmitHandler}
                className={styles.usernameSubmit}
            />
        </div>

    )
}
