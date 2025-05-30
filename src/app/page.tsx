"use client";

import styles from "./page.module.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie, getCookie } from "./api/cookies";

import { socket } from "./api/socket";

function checkRoomExists(roomName: string) {
  return new Promise((resolve) => {
    socket.emit("checkRoomExists", roomName, (res: any) => {
      resolve(res);
    });
  });
}

export default function Home() {
  const [input, setInput] = useState("");
  const [usernameVal, setUsernameVal] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const [usernamePropmtAl, setPromptAl] = useState(0);


  const router = useRouter();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    if (getCookie("username")) {
      setPromptAl(0)
    } else {
      setPromptAl(1)
    }

    function onConnect() {

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

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const newGameButtonHandler = async () => {
    //
    const socketId: any = socket.id;

    if (!input) {
      socket.emit("join", { value: socketId });
      router.push(socketId); // создание новой комнаты
    }
  };

  const joinGameButtonHandler = async () => {
    const socketId: any = socket.id;
    const roomExist: unknown = await checkRoomExists(input);

    if (roomExist) {
      socket.emit("guess_join", { value: socketId, input: input });
      router.push(input); // присоеденение гостя к хосту
    }
  };

  const usernameSubmitHandler = () => {
    if (usernameVal) {
      setPromptAl(0)
      setCookie("username", usernameVal);
    }
  };

  return (
    <div className={styles.page}>
      <input
        type="text"
        onChange={(e) => setInput(e.target.value)}
        className={styles.idInput}
      />
      <button
        onClick={newGameButtonHandler}
        disabled={!isConnected}
        className={styles.newGameBtn}
      >
        new game
      </button>
      <button className={styles.joinGameBtn} onClick={joinGameButtonHandler}>
        join game
      </button>
      <div className={styles.usernamePrompt} style={{display: (usernamePropmtAl) ? "flex" : "none"}}>
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
    </div>
  );
}
