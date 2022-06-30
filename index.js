'use strict'

import env from 'env-var'
import mqtt from 'mqtt'
import WebSocket from 'ws'
import Pws from 'pws'

const WebsocketUrl = env.get('WEBSOCKET_URL').required().asString()
const ApiKey = env.get('API_KEY').required().asString()
const Token = env.get('TOKEN').required().asString()
const MqttUrl = env.get('MQTT_URL').required().asString()
const MqttUsername = env.get('MQTT_USERNAME').asString()
const MqttPassword = env.get('MQTT_PASSWORD').asString()
const MqttTopic = env.get('MQTT_TOPIC').required().default('fh-do/ehz/power').asString()
const PropertyName = env.get('PROPERTY_NAME').required().asString()

const websocket = Pws(WebsocketUrl, WebSocket, {
  headers: {
    'X-Host-Override': 'wot-device-api',
    'x-api-key': ApiKey,
    Authorization: `Bearer ${Token}`
  }
})

websocket.on('open', () => {
  const mqttClient = mqtt.connect(MqttUrl, {
    username: MqttUsername,
    password: MqttPassword
  })

  mqttClient.on('connect', async () => {
    websocket.on('message', (data) => {
      const measurement = JSON.parse(data)
      mqttClient.publish(MqttTopic, JSON.stringify({
        value: measurement[PropertyName],
        time: Date.parse(measurement.time)
      }))
    })
  })
})