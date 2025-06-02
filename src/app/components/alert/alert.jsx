import styles from "./alert.module.css"

export default function Alert(props) {
    return (
        <div className={styles.alert} style={{top: props.top}}>
            <p>{props.text}</p>
        </div>
    )
}