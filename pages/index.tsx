import React, { Component, useEffect, useState } from "react"
import ODb from "../assets/db"
import P2PNode from "../assets/node"
import "./index.css"
const IPFS = require("ipfs-core")
const OrbitDB = require("orbit-db")

const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string")

const { toString: uint8ArrayToString } = require("uint8arrays/to-string")
const { Ed25519Provider } = require("key-did-provider-ed25519")
const { default: KeyResolver } = require("key-did-resolver")
const Identities = require("orbit-db-identity-provider")

const Home = () => {



	const [node, setNode] = useState({} as P2PNode)
	const [message, setMessage] = useState("")
	const [chat, setChat] = useState("");
	const [dbOrbit, setDbOrbit] = useState(new ODb()) 
	const [nameDb, setNameDb] = useState("")
	const [selectedDb, setSelectedDb] = useState(null)

	useEffect(() => {
		if (typeof window === "undefined") {
		} else {
			const tronWeb = window["tronWeb"];
			if (!tronWeb) {
				setNameDb("TJj2AWRY4cPEuu24TsJM9ZmPbaiNsiXp3Y")
				// alert("Need to install TronLink")
			} else {
				setNameDb(tronWeb.defaultAddress.base58);				
			}
		}
	
	}, [])

	useEffect(() => {
		(async () => {
			if(nameDb) {
			console.log("🚀 ~ file: index.tsx ~ line 38 ~ nameDb", nameDb)

				await dbOrbit.createInstance()
				const newNode = new P2PNode(false, setChat);
				newNode.setTopic(nameDb)
				await newNode.start()
				setNode(newNode)
				const db = await dbOrbit.getDb(nameDb);
				setSelectedDb(db)
			}
		})();  
	}, [nameDb])

	 useEffect(() => {
		console.log('selectedDb :>>', selectedDb)
		if(selectedDb) {
			const allMessages = []
		
		const posts = selectedDb?.iterator().collect()
		posts?.forEach((post) => {
			allMessages.push(post.payload.value)
		 
		})
		console.log("🚀 ~ file: index.tsx ~ line 58 ~ useEffect ~ allMessages", allMessages)
		selectedDb?.events.on("replicated", address => {
			console.log("🚀 ~ file: index.tsx ~ line 66 ~ useEffect ~ address", address)
			console.log(selectedDb?.iterator({ limit: -1 }).collect())
		  })
			selectedDb?.events.on('ready', () => {
				const posts = selectedDb?.iterator().collect()
				console.log("🚀 ~ file: index.tsx ~ line 59 ~ selectedDb?.events.on ~ posts", posts)
				posts?.forEach((post) => console.log(post ))
				// Hello
				// World  
			  })
			  selectedDb?.events.on('write', (address, entry, heads) => {
			  console.log("🚀 ~ file: index.tsx ~ line 63 ~ selectedDb?.events.on ~ heads", heads)
			  console.log("🚀 ~ file: index.tsx ~ line 63 ~ selectedDb?.events.on ~ entry", entry)
			  console.log("🚀 ~ file: index.tsx ~ line 63 ~ selectedDb?.events.on ~ address", address)

			  })
		}
	 }, [selectedDb])

	const sendMessage = async () => {  
		const allMessages = []
		const posts = selectedDb?.iterator().collect()
		posts?.forEach((post) => {
			allMessages.push(post.payload.value)
		 
		})
		allMessages.push({ title: 'Hello', content: message })
		const res = await selectedDb?.add(allMessages)
		 if(res) {
			const posts = selectedDb?.iterator().collect()
		
		 }
		node.publish(
			node.topic,
			message
		)
	}

	return (
		<>
		<div className="chat">
		<p>P2P chat</p>
			<p id="test1"></p>

			<input id="input" onChange={(e) => setMessage(e.target.value)}></input>
			<button
				onClick={() => sendMessage()}
			>
				submit
			</button>
			<p>
				{" "}
				got message: <span id="output">{chat}</span>
			</p>
			<p>number of peers: {node.numPeers} </p>
		</>
			


		</>
	)
}
export default Home;