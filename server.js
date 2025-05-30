import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("new server connection: ", socket.id);

    socket.on("join", (data) => {
        socket.join(data.value)
        console.log("host join:", data.value)
    });

    socket.on("checkRoomExists", (roomName, callback) => {
        const roomExists = io.sockets.adapter.rooms.has(roomName)
        callback(roomExists)
    })

    socket.on("guess_join", (data) => {
        socket.join(data.input)
    })

    socket.on("guess_join_by_url", (room) => {
      if (io.sockets.adapter.rooms.has(room)) {
        socket.join(room)
      }
    })


  });

  httpServer.listen(port, () => {
    console.log(`> listen on http://${hostname}:${port}`);
  });
});
