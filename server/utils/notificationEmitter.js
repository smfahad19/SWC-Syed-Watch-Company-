import { EventEmitter } from 'events'

const notificationEmitter = new EventEmitter()
notificationEmitter.setMaxListeners(50)

export default notificationEmitter