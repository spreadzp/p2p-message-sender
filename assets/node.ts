"use strict";

import assert from "assert";

 

const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string");
const { toString: uint8ArrayToString } = require("uint8arrays/to-string");
const { concat: toUint8ArrayLength } = require("uint8arrays/concat")
const Libp2p = require("libp2p");
const WebSockets = require("libp2p-websockets");
const WebRtcStar = require("libp2p-webrtc-star");
const WebRtcDirect = require("libp2p-webrtc-direct");
const { NOISE } = require("libp2p-noise");
const MPLEX = require("libp2p-mplex");
const Bootstrap = require("libp2p-bootstrap");
const Gossipsub = require("libp2p-gossipsub");
const Crypto = require("libp2p-crypto");
import Peer from "libp2p-peer-id" 

export default class P2PNode {
  node: any;
  topic: string = "test";
  numPeers: number = 0;
  storemsgs: boolean = false;
  msgs: any[] = [];
  peer: any;
  cb: Function

  constructor(storemsgs?: boolean, cb?: Function) {
    this.storemsgs = storemsgs; 
    this.peer = Peer?.PeerId,
    this.cb = cb
  }

  setTopic(newTopic: string) {
    this.topic = newTopic;
  }

  async start() {
    const k = await Crypto.keys.generateKeyPair('ed25519')
    // console.log("🚀 ~ file: node.ts ~ line 33 ~ P2PNode ~ start ~ k", k._key)
    // console.log('k. :>>', k._idB58String())
    const seed = toUint8ArrayLength(k._key, 32)
    // console.log("🚀 ~ file: node.ts ~ line 33 ~ P2PNode ~ start ~ seed", seed)
    const keys = await Crypto.keys.generateKeyPairFromSeed("ed25519", k._key)
    // console.log("🚀 ~ file: node.ts ~ line 29 ~ P2PNode ~ start ~ keys", keys)
   const strKey =  uint8ArrayToString(keys._key )
   const uintKey = uint8ArrayFromString(strKey)
   // console.log("🚀 ~ file: node.ts ~ line 35 ~ P2PNode ~ start ~ uintKey", uintKey)
   // console.log('keys._key =  uintKey :>>', keys._key ===  uintKey)
   const buf = uint8ArrayFromString('12D3KooWbtp1AcgweFSArD7dbKWYpAr8MZR1tofwNwLFLjeNGLWa', 'base58btc')
   //const id = Peer?.PeerId.fromCID()
   const peerId =  await Peer?.PeerId.fromKeys(k._publicKey, k._key)
   // console.log("🚀 ~ file: node.ts ~ line 45 ~ P2PNode ~ start ~ peerId", peerId) 
   //assert(keys._key ===  uintKey, "not Equal") 
    this.node = await Libp2p.create({
      peerId: peerId,
      modules: {
        transport: [WebSockets, WebRtcStar, WebRtcDirect],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
        peerDiscovery: [Bootstrap],
        pubsub: Gossipsub,
      },
      addresses: {
        listen: [
          "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
          "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        ],
      },
      config: {
        peerDiscovery: {
          [Bootstrap.tag]: {
            enabled: true,
            list: [
              "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            ],
          },
        },
        pubsub: {
          enabled: true,
          emitSelf: true,
        },
      },
    });

    await this.node.start();
    console.log(this.node);

    // setting node properties

    // const advertiseAddrs = this.node.multiaddrs;
    // console.log(
    //   "your salix node is advertising the following addresses: ",
    //   advertiseAddrs.toString()
    // );

    this.node.pubsub.subscribe(this.topic);

    this.node.on("peer:discovery", (peer) => {
      // console.log("found peer: " + peer._idB58String);
      this.numPeers = this.numPeers += 1;
      // console.log("🚀 ~ file: node.ts ~ line 109 ~ P2PNode ~ this.node.on ~ this.numPeers", this.numPeers);       
    });

    this.node.pubsub.on(this.topic, (msg) => {
      console.log("🚀 ~ file: node.ts ~ line 82 ~ P2PNode ~ this.node.pubsub.on ~ msg", msg)
      console.log(`got message: ${uint8ArrayToString(msg.data)}`);
      console.log('this.cb :>>', this.cb(uint8ArrayToString(msg.data)))
      if (this.storemsgs === true) {
        this.msgs.push(msg);
      }
      /*window.document.getElementById("output").innerText = uint8ArrayToString(
        msg.data
      );*/
    });

    this.publish(this.topic,"test");
  }

  publish(topic: string, msg: string) {
    this.node.pubsub.publish(topic, uint8ArrayFromString(msg));
  }

  next() {
    let ret = this.msgs[0];
    this.msgs = this.msgs.slice(1);
    return ret;
  }
}
