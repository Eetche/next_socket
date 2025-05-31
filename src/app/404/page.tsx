import styles from "./404.module.css"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "404"
}

export default function Page() {
    return (
        <div className={styles.Page}>Адрес не найден.</div>
    )
}
