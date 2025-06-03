"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { socket } from "../api/socket";

import styles from "./slug.module.css";

import { getCookie } from "../api/cookies";

import UsernamePrompt from "../components/usernamePrompt/usernamePrompt";
import Alert from "../components/alert/alert"
import Game from "../components/game/game";

function checkRoomExists(roomName: string) {
  return new Promise((resolve) => {
    socket.emit("checkRoomExists", roomName, (res: any) => {
      resolve(res);
    });
  });
}

function checkPlayersInRoom(room: string) {
  return new Promise((resolve) => {
    socket.emit("checkPlayersCount", room, (res: any) => {
      resolve(res)
    })
  })
}

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const router = useRouter()

  let params: any = useParams();

  const [username, setUsername] = useState("")


  const [leftTeam, setLeftTeam] = useState<string[]>([])
  const [rightTeam, setRightTeam] = useState<string[]>([])

  const [readyVal, setReadyVal] = useState(0)
  const [playersVal, setPlayersVal] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const [alertTop, setAlertTop] = useState(-50)
  const [alertText, setAlertText] = useState("")

  const [startBtnDisp, setStartBtnDisp] = useState("none")

  const [gameDisp, setGameDisp] = useState("none")
  const [pageDisp, setPageDisp] = useState("flex")

  const [speakers, setSpeakers] = useState<string[]>([])
  const [guessers, setGuessers] = useState<string[]>([])

  const [readyDisabled, setReadyDisabled] = useState(true)

  function hideForGame() {
    setPageDisp("none")
    setGameDisp("flex")
    setStartBtnDisp("none")
  }

  useEffect(() => {

    setUsername(getCookie("username"))

    socket.emit("guess_join_by_url", params.slug);

    if (socket.connected) {
      onConnect();
    }

    async function onConnect() {

      const playersCount: any = await checkPlayersInRoom(params.slug)
      setPlayersVal(playersCount)

      const roomExists = await checkRoomExists(params.slug)

      if (!roomExists) {
        router.replace("404") // redirect user to 404 page
      }

      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }


    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");

    }

    socket.on("connect", onConnect);
    socket.on("disconnect", () => {
      onDisconnect()
    });

    socket.on("update_players_count", async () => {
      const playersCount: any = await checkPlayersInRoom(params.slug)
      setPlayersVal(playersCount)
    });

    socket.on("update_teams", (teams) => {
      const curUsername = getCookie("username")

      setLeftTeam(teams.leftTeam)
      setRightTeam(teams.rightTeam)

      if (teams.leftTeam.includes(curUsername) || teams.rightTeam.includes(curUsername)) {
        setReadyDisabled(false)
      } else {
        setReadyDisabled(true)
      }
    })

    socket.on("update_ready", (newReadyVal) => {
      setReadyVal(newReadyVal)
    })

    socket.on("host_starting", async () => {
      console.log(leftTeam, rightTeam, playersVal)
      if (socket.id == params.slug) {
        setStartBtnDisp("block")
      } else {
        setStartBtnDisp("none")
      }
    })

    socket.on("hide_start_btn", () => {
      if (socket.id == params.slug) {
        setStartBtnDisp("none")
      }
    })

    socket.on("start_hand", (players) => {
      hideForGame()
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  function newAlert(text: string) {

    setAlertTop(0)
    setAlertText(text)

    setTimeout(() => {
      setAlertTop(-50)
    }, 3000)
  }


  const teamsClickHandler = (team: string) => {
    socket.emit("team_hand", {
      slug: params.slug,
      leftTeam: leftTeam,
      rightTeam: rightTeam,
      username: username,
      team: team
    })
  }

  const readyBtnHandler = () => {
    if ((playersVal == 2 || playersVal == 4)) {

      const newIsReady = !isReady
      setIsReady(newIsReady)

      socket.emit("ready_hand", newIsReady, params.slug)
    } else {
      newAlert("Невозможно начать игру")
    }
  }

  const startBtnHandler = async () => {
    if ((leftTeam.length == 2 || rightTeam.length == 2 && playersVal == 2) || (leftTeam.length == 2 && rightTeam.length == 2 && playersVal == 4)) {
      hideForGame()
      socket.emit("start_send", {
        leftTeam: leftTeam,
        rightTeam: rightTeam,
        room: params.slug
      })
    } else {
      newAlert("Невозможно запустить игру")
    }

  }


  return (
    <div className={styles.slugPage}>
      <Alert top={alertTop} text={alertText} />
      <UsernamePrompt />
      <Game display={gameDisp} />
      <div className={styles.teams} style={{ display: pageDisp }}>
        <div className={styles.leftTeam} onClick={() => teamsClickHandler("left")}>
          <p>{leftTeam[0]}</p>
          <p>{leftTeam[1]}</p>
        </div>
        <div className={styles.rightTeam} onClick={() => teamsClickHandler("right")}>
          <p>{rightTeam[0]}</p>
          <p>{rightTeam[1]}</p>
        </div>
      </div>
      <div className={styles.ready}>
        <p style={{ display: pageDisp }}>{readyVal}/{playersVal}</p>
        <button className={styles.readyBtn} onClick={readyBtnHandler} disabled={readyDisabled} style={{ display: pageDisp }}>Готов</button>
        <button className={styles.startBtn} onClick={startBtnHandler} style={{ display: startBtnDisp }}>Начать</button>
      </div>
    </div>
  )
}
