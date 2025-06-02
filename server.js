import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import fs from "fs"

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

  let currentRoom;

  let playersReady = new Map();

  io.on("connection", (socket) => {
    console.log("new server connection: ", socket.id);


    socket.on("read_words", (room) => {
      fs.readFile("./src/app/russian-words.txt", "utf8", (err, data) => {
        const lines = data.split("\n")
        io.to(room).emit("success_read", lines)
      })
    })

    socket.on("join", (data) => {
      socket.join(data.value)
      currentRoom = data.value
      socket.to(data.value).emit("update_players_count")


      if (!playersReady.has(currentRoom)) {
        playersReady.set(currentRoom, new Set())
      }

    });

    socket.on("checkRoomExists", (roomName, callback) => {
      const roomExists = io.sockets.adapter.rooms.has(roomName)
      callback(roomExists)
    })

    socket.on("checkPlayersCount", async (roomName, callback) => {
      const sockets = await io.in(roomName).fetchSockets()
      callback(sockets.length)
    })

    socket.on("guess_join_by_url", (room) => {
      if (io.sockets.adapter.rooms.has(room)) {
        currentRoom = room
        socket.join(room)
        socket.to(room).emit("update_players_count")
      }
    })

    socket.on("disconnect", () => {
      console.log(`client disconnected: ${socket.id}, room: ${currentRoom}`)
      playersReady.get(currentRoom).delete(socket.id)
      socket.to(currentRoom).emit("update_players_count")
      io.to(currentRoom).emit("update_ready", playersReady.get(currentRoom).size)

      if (socket.id == currentRoom) {
        playersReady.delete(currentRoom)
      }
    })

    socket.on("team_hand", (data) => {
      const slug = data.slug
      const username = data.username
      const team = data.team


      if (team == "left" && leftTeam.length < 2) {

        if (rightTeam.includes(username)) {
          rightTeam = rightTeam.filter((player) => player !== username)
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
    })

    socket.on("ready_hand", (isReady, room) => {
      if (isReady) {
        playersReady.get(room).add(socket.id)
      } else {
        playersReady.get(room).delete(socket.id)
      }

      if (playersReady.get(room).size == 2 || playersReady.get(room).size == 4 && socket.id == room) {
        io.to(room).emit("host_starting")
      } else {
        io.to(room).emit("hide_start_btn")
      }

      io.to(room).emit("update_ready", playersReady.get(room).size)

    })

    socket.on("start_send", async (data) => {
      const randomFloor = Math.random()

      const leftTeam = data.leftTeam
      const rightTeam = data.rightTeam

      const speakers = []
      const guessers = []

      const playersVal = await io.in(data.room).fetchSockets()

      function sortPlayers(revers) {
        if (leftTeam.length == 2 || rightTeam.length == 2 && playersVal == 2) {
          if (revers) {
            speakers.push(leftTeam[0])
            guessers.push(leftTeam[1])
          } else {
            speakers.push(leftTeam[1])
            guessers.push(rightTeam[1])
          }
        } else if (leftTeam.length == 2 && rightTeam.length == 2 && playersVal == 4) {
          if (revers) {
            speakers.push(leftTeam[0], rightTeam[1])
            guessers.push(leftTeam[1], rightTeam[0])
          } else {
            speakers.push(leftTeam[1], rightTeam[0])
            guessers.push(leftTeam[0], rightTeam[1])
          }
        }
      }

      if (randomFloor > 0.5) {
        sortPlayers(true)
        console.log(`speakers: ${speakers} \n guessers: ${guessers}`)
      } else {
        sortPlayers(false)
        console.log(`speakers: ${speakers} \n guessers: ${guessers}`)
      }


      
      io.to(data.room).emit("start_hand", {
        speakers: speakers,
        guessers: guessers
      })

    })

  });

  httpServer.listen(port, () => {
    console.log(`> listen on http://${hostname}:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
  });
});
