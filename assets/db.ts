const IPFS = require("ipfs-core")
const OrbitDB = require("orbit-db")

const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string")

const { toString: uint8ArrayToString } = require("uint8arrays/to-string")
const { Ed25519Provider } = require("key-did-provider-ed25519")
const { default: KeyResolver } = require("key-did-resolver")
const Identities = require("orbit-db-identity-provider")


export default class ODb { 
    orbitdb: any;
    selectedDb: any;
    constructor( ) {       
    }

    async createInstance () {
    Identities.DIDIdentityProvider.setDIDResolver(KeyResolver.getResolver())

		const seed = new Uint8Array(32) // 32 bytes of entropy (Uint8Array)
		seed[0] = 123
	const didProvider = new Ed25519Provider(seed)
	const thisIdentity = await Identities.createIdentity({
		type: "DID",
		didProvider,
	})
	console.log("🚀 ~ file: index.tsx ~ line 37 ~ initDB ~ thisIdentity", thisIdentity)

	// Create IPFS instance
	const ipfsOptions = { repo: "./ipfs" }
	 const ipfs = await IPFS.create(ipfsOptions)

	// Create OrbitDB instance
	this.orbitdb = await OrbitDB.createInstance(ipfs, {
		identity: thisIdentity,
	})
    // const ipfs = await IPFS.create()
    // this.orbitdb = await OrbitDB.createInstance(ipfs)
  
    return this.orbitdb;
  }

  async getDb(nameDb: string) {
    this.selectedDb = await this.orbitdb.log(nameDb);
    await this.selectedDb.load()
    return this.selectedDb;
  }
	
  async addDataToDb (message: string) {
	const hash = await this.selectedDb.add(message);
    const event = this.selectedDb.get(hash).payload.value //.map((e) => e.payload.value);
	console.log(event)
  }
	// console.log("🚀 ~ file: index.tsx ~ line 53 ~ initDB ~ db", db)
	// window.document.getElementById("test1").innerText = JSON.stringify(
	// 	orbitdb.identity,
	// )

    async getAllData () {
        return await this.selectedDb.get()
    }
}