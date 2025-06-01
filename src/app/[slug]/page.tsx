"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { socket } from "../api/socket";

import styles from "./slug.module.css";

import { getCookie } from "../api/cookies";

import UsernamePrompt from "../components/usernamePrompt/usernamePrompt";
import Alert from "../components/alert/alert"

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
      setLeftTeam(teams.leftTeam)
      setRightTeam(teams.rightTeam)
    })

    socket.on("ready_received", (newReadyVal) => {
      setReadyVal(newReadyVal)
    })  

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  
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
    if (playersVal == 2 || playersVal == 4) {

      const newIsReady = !isReady
      setIsReady(newIsReady)
      socket.emit("ready_hand", newIsReady)
    } else {
      alert("не выполнено")
    }
    console.log(isReady)
  }

  return (
    <div className={styles.slugPage}>
      <Alert/>
      <UsernamePrompt />
      <p className={styles.roomId}>ID Комнаты: {params.slug} <br /> Имя пользователя: {username}</p>
      <div className={styles.teams}>
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
        <p>{readyVal}/{playersVal}</p>
        <button className={styles.readyBtn} onClick={readyBtnHandler}>Готов</button>
      </div>
    </div>
  )
}
