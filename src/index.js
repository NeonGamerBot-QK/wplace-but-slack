require('dotenv/config')
const express = require('express')
const socketIO = require('socket.io')
const http = require('http')

const app = express()

const server = http.createServer(app)
const io = socketIO(server)
const PORT = process.env.PORT || 3000

io.on('connection', (socket) => {
    socket.on('get-emojis')
})