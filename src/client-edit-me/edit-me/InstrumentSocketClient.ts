/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import {
  Instrument,
  InstrumentSymbol,
  WebSocketClientMessageJson,
  WebSocketMessage,
  WebSocketReadyState,
  WebSocketServerMessageJson,
} from "../../common-leave-me";

/**
 * Notes:
 * 
 * To subscribe or unsubscribe to/from instrument(s), send a message to the server with the following format:
 * 
 * export type WebSocketClientMessageJson =
  | {
      type: "subscribe";
      instrumentSymbols: InstrumentSymbol[];
    }
  | {
      type: "unsubscribe";
      instrumentSymbols: InstrumentSymbol[];
    };
  *
  * The server will start responding with a message with the following format:
  * 
  * export type WebSocketServerMessageJson = {
      type: "update";
      instruments: Instrument[];
    };
 */

type InstrumentSubscriber = (data: Instrument[]) => void
type MessageHandler = (event: MessageEvent) => void

/**
 * ❌ Please do not edit this class name
 */
export class InstrumentSocketClient {
  /**
   * ❌ Please do not edit this private property name
   */
  private _socket: WebSocket;
  private _instrumentSubscriptions = new Map<MessageHandler, {instrumentSymbols: InstrumentSymbol[]}>();

  /**
   * ✅ You can add more properties for the class here (if you want) 👇
   */

  constructor() {
    /**
     * ❌ Please do not edit this private property assignment
     */
    this._socket = new WebSocket("ws://localhost:3000/ws");

    /**
     * ✅ You can edit from here down 👇
     */
    this._socket.onerror = () => this._socket.close()
  }

  private parseEventMessage(event: MessageEvent) {
    try {
      return JSON.parse(event.data) as WebSocketServerMessageJson
    } catch (e) {
      console.error('Cannot parse server message', e)
    }
  }

  private handleMessageSubAndUnsub(instrumentSymbols: InstrumentSymbol[], instrumentSub: InstrumentSubscriber )  {
    const handleMessageEvent = (event: MessageEvent) => {
      const data = this.parseEventMessage(event)
      if(!data) return;
      instrumentSub(data.instruments.filter(instrument => instrumentSymbols.includes(instrument.code)))
    }

    this._instrumentSubscriptions.set(handleMessageEvent, {instrumentSymbols})
    this._socket.addEventListener('message', handleMessageEvent)
    
    return () => {
      this._socket.removeEventListener('message', handleMessageEvent)
      this._instrumentSubscriptions.delete(handleMessageEvent) 

      // For this code to work, the code on line 78 in App.tsx needs modification
      // const subcribedSymbols = [...this._instrumentSubscriptions.values()].flatMap(({instrumentSymbols}) => instrumentSymbols)
      // const symbolsToUnsubscribe = instrumentSymbols.filter((sym) => !subcribedSymbols.includes(sym))
      // if(symbolsToUnsubscribe.length && this._socket.readyState === 1) {
      //   this._socket.send(JSON.stringify({
      //     type: 'unsubscribe',
      //     instrumentSymbols: symbolsToUnsubscribe
      //   }))
      // }
    }
  }

  subscribe(instrumentSymbols: InstrumentSymbol[], instrumentSub: InstrumentSubscriber ) {
    const socketInstrumentSubscribe = () => {
      this._socket.send(JSON.stringify({
        type: "subscribe",
        instrumentSymbols: instrumentSymbols
      }))
    }

    if(this._socket.readyState !== 1) {
      this._socket.addEventListener('open', () => {
        socketInstrumentSubscribe()
        this._socket.removeEventListener('open', socketInstrumentSubscribe)
      })
    } else {
      socketInstrumentSubscribe()
    };


    return this.handleMessageSubAndUnsub(instrumentSymbols, instrumentSub)
  }
}
