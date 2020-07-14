

import io from 'socket.io-client';
import { SOCKET } from './constants/index'
import { isBuffer } from 'lodash';

const Socket = {
    socket: false,
    isConnected: false,

    connect(callback = null) {
        this.socket = io(SOCKET);
        this.socket.on("connect", () => {
            this.isConnected = true
            if(callback) callback()
        })
    },

    getSocket() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) return resolve(this.socket) 
            const _this = this

            let interval = setInterval(() => {
                if (_this.isConnected) {
                    clearInterval(interval)
                    resolve(_this.socket)
                }
            }, 1000)
        })

    }
}



export default Socket;