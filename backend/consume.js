const { Kafka, logLevel } = require("kafkajs")

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "jitendra"

const kafka = new Kafka({
	clientId,
	brokers,
	// logCreator: customLogger,
	// logLevel: logLevel.DEBUG,
})


const consumer = kafka.consumer({
	groupId: clientId,
	minBytes: 5,
	maxBytes: 1e6,
	maxWaitTimeInMs: 3000,
})

const consume = async () => {
	await consumer.connect()
	await consumer.subscribe({ topic, fromBeginning: true })
	await consumer.run({
		eachMessage: ({ message }) => {
			console.log(`received message: ${message.value}`)
			console.log(`key: ${message.key}`)
		},
	})
}

module.exports = consume