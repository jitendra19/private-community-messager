const { Kafka, logLevel } = require("kafkajs")

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "jitendra"

const kafka = new Kafka({
	clientId, brokers,
	// logLevel: logLevel.DEBUG
})
const producer = kafka.producer({})

const produce = async () => {
	await producer.connect()
	let i = 0;
}


const sendMessage = async (message) => {
	try {
		const key = `${message.username}__${message.id}`;
		await producer.send({
			topic,
			messages: [
				{
					key: key,
					value: message.body,
				},
			],
		})
	} catch (err) {
		console.error("could not write message " + err)
	}
}

module.exports = {produce, producer, sendMessage}