import io from "socket.io-client";

const ip = window.location.hostname;

export const socket = io(`http://${ip}:3000`, { autoConnect: false });

