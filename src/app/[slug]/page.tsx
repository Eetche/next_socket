"use client";

import { useParams, usePathname } from "next/navigation";
import { socket } from "../socket";
import { useEffect, useState } from "react";

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  let params : any = useParams()

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

    socket.on("game_join", (value) => {
        console.log("game join:", value)
    })

    socket.on("move_received", () => {
        console.log("move")
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const buttonHandler = () => {
    socket.emit("move", {slug: params.slug})
  }

  return (
    <div>
      <h1>ID Комнаты: {params.slug}</h1>
      <button onClick={buttonHandler}>Test</button>
    </div>
  );
}
