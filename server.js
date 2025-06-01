import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  let leftTeam = []
  let rightTeam = []

  io.on("connection", (socket) => {
    console.log("new server connection: ", socket.id);

    socket.on("join", (data) => {
      socket.join(data.value)
      console.log("join:", data.value)
    });

    socket.on("checkRoomExists", (roomName, callback) => {
      const roomExists = io.sockets.adapter.rooms.has(roomName)
      callback(roomExists)
    })

    socket.on("guess_join_by_url", (room) => {
      if (io.sockets.adapter.rooms.has(room)) {
        socket.join(room)
      }
    })

    socket.on("teamHand", (data) => {
      const slug = data.slug
      const username = data.username
      const team = data.team


      if (team == "left" && leftTeam.length < 2) {

        if (rightTeam.includes(username)) {
          rightTeam = rightTeam.filter((player) => player !== username)
          console.log(`массив после фильтра: ${rightTeam}`)
          leftTeam.push(username)
        } else if (!rightTeam.includes(username) && !leftTeam.includes(username)) {
          leftTeam.push(username)
        } 


      } else if (team == "right" && rightTeam.length < 2) { 

        if (leftTeam.includes(username)) { 

          leftTeam = leftTeam.filter((player) => player !== username)
          rightTeam.push(username)

        } else if (!leftTeam.includes(username) && !rightTeam.includes(username)) {

          rightTeam.push(username) 

        }
      }

      io.to(slug).emit("update_teams", {
        leftTeam: leftTeam,
        rightTeam: rightTeam
      })

      console.log(`rightTeam: ${rightTeam}`)
      console.log(`left team: ${leftTeam} \n`)
    })


  });

  httpServer.listen(port, () => {
    console.log(`> listen on http://${hostname}:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
  });
});
