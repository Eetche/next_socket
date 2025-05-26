"use client";

import styles from "./page.module.css";

import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function Home() {
  const [input, setInput] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
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


  const buttonHandler = () => {
    console.log("client emit message")
    socket.emit("message", {value: input})
  };

  return (
    <div className={styles.page}>
      <input type="text" onChange={(e) => setInput(e.target.value)} />
      <button onClick={buttonHandler} disabled={!isConnected}>
        SEND
      </button>
      <p>{`Connection status: ${isConnected}`}</p>
    </div>
  );
}
