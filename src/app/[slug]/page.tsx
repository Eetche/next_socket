"use client";

import { useParams, useRouter } from "next/navigation";
import { socket } from "../api/socket";
import { useEffect, useState } from "react";
import styles from "./slug.module.css";
import { getCookie } from "../api/cookies";

import UsernamePrompt from "../components/usernamePrompt/usernamePrompt";

function checkRoomExists(roomName: string) {
  return new Promise((resolve) => {
    socket.emit("checkRoomExists", roomName, (res: any) => {
      resolve(res);
    });
  });
}

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const router = useRouter()

  let params: any = useParams();

  const [username, setUsername] = useState("")


  const [leftTeam, setLeftTeam] = useState<string[]>([])
  const [rightTeam, setRightTeam] = useState<string[]>([])

  useEffect(() => {
    setUsername(getCookie("username"))

    socket.emit("guess_join_by_url", params.slug);

    if (socket.connected) {
      onConnect();
    }
    async function onConnect() {
      console.log("new client connection:", socket.id);

      const roomExists = await checkRoomExists(params.slug)

      console.log(roomExists)

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
    socket.on("disconnect", onDisconnect);

    socket.on("game_join", (value) => {
      console.log("game join:", value);
    });

    socket.on("move_received", () => {
      console.log("move");
    });


    socket.on("update_teams", (teams) => {
      setLeftTeam(teams.leftTeam)
      setRightTeam(teams.rightTeam)
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const teamsClickHandler = (team: string) => {
    socket.emit("teamHand", {
      slug: params.slug,
      leftTeam: leftTeam,
      rightTeam: rightTeam,
      username: username,
      team: team
    })
    
  };

  return (
    <div className={styles.slugPage}>
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
      <UsernamePrompt />
    </div>
  );
}
