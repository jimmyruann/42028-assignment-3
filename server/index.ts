import express, { Application, Request, Response } from "express";
import http from "http";
import so from "socket.io";
import cors from "cors";
import path from "path";
import API_Routes from "./api";

const app: Application = express();
const server = http.createServer(app);
const io = new so.Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

const port: number = parseInt(process.env.PORT || "3001");

app.use(cors());
// Frontend
app.use(express.static(path.join(process.cwd(), "frontend/build")));
// Backend
app.use("/api", API_Routes.r(io));

server.listen(port, () => {
	console.log(`App is listening on port ${port} !`);
});
