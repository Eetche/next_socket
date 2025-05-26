import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000

const app = next({dev, hostname, port})
const handler = app.getRequestHandler()

app.prepare().then(() => {
    const httpServer = createServer(handler)

    const io = new Server(httpServer)

    io.on("connection", (socket) => {
        console.log("new server connection: ", socket.id)

        socket.on("message", (data) => {
            socket.broadcast.emit("message", {value: data.value})
        })
    })


    httpServer.listen(port, () => {
        console.log(`> listen on http://${hostname}:${port}`)
    })
})
