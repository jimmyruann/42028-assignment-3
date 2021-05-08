import axios from "axios";
import io from "socket.io-client";

const hostURL = process.env.NODE_ENV === "production" ? window.location.host : "localhost:3001";

export const axiosInstance = axios.create({
	baseURL: `http://${hostURL}/api/`,
});

export const socketIO = io(`ws://${hostURL}`);
