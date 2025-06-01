import { useState } from "react";
import styles from "./alert.module.css"

export default function Alert() {
    const [alertTxt, setAlertTxt] = useState("")

    const useAlert = () => {
        
    }

    
    return (
        <div className={styles.alert}>
            <p>{alertTxt}</p>
        </div>
    )
}