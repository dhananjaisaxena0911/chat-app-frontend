import { io } from "socket.io-client";
import { getBackendUrl } from './api';

const socket = io(getBackendUrl(), {
  transports: ["websocket"],
});

export default socket;
