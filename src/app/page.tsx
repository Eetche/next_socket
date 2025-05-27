"use client";

import styles from "./page.module.css";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { socket } from "./socket";

function checkRoomExists(roomName : string) {
  return new Promise((resolve) => {
    socket.emit("checkRoomExists", roomName, (res : any) => {
      resolve(res)
    })
  })
}

export default function Home() {
  const [input, setInput] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const router = useRouter()

  const pathname = usePathname()

  useEffect(() => {
    console.log(socket.connected)
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("new client connection:", socket.id);

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

    socket.on("message", (data) => {
      alert(`new message from server: ${data.value}`)
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };

  }, []);


  const buttonHandler = async () => {

    const socketId : any = socket.id
    const roomExist : unknown = await checkRoomExists(input)

    if (!input) {

      console.log("client emit message")
      socket.emit("join", {value: socketId})
      router.push(socketId) // создание новой комнаты

    } else if (input && roomExist) {

      console.log(checkRoomExists(input))
      socket.emit("guess_join", {value: socketId, input: input})
      console.log(`guess ${socketId} joined to ${input}`)
      router.push(input) // присоеденение гостя к хосту

    }
  };

  return (
    <div className={styles.page}>
      <input type="text" onChange={(e) => setInput(e.target.value)} />
      <button onClick={buttonHandler} disabled={!isConnected} className={styles.newGameBtn}>
        new game
      </button>
    </div>
  );
}
