/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import { useEffect, useState, useCallback } from 'react';
import { InstrumentSymbol, Instrument } from "../../common-leave-me";
import { InstrumentSocketClient } from "./InstrumentSocketClient";
import './InstrumentReel.css';

/**
 * ❌ Please do not edit this
 */
const client = new InstrumentSocketClient();

type InstrumentWithPercentageChange = Instrument & { percentageChange: number }

/**
 * ❌ Please do not edit this hook name & args
 */
function useInstruments(instrumentSymbols: InstrumentSymbol[]) {
  /**
   * ✅ You can edit inside the body of this hook
   */
  const [instrumentsData, setInstrumentData] = useState<InstrumentWithPercentageChange[]>()

  const subscribeCallback = useCallback((data: Instrument[]) => {
    setInstrumentData((prev) => {
      const getPercentageChange = (instrument: Instrument) => {
        const prevQuote = prev?.find(({code}) => code === instrument.code)?.lastQuote ?? instrument.lastQuote;
        return ((instrument.lastQuote - prevQuote) / prevQuote) * 100;
      }

      return data.map((instrument) => ({...instrument, percentageChange: getPercentageChange(instrument)}))
    })
  }, [])

  useEffect(() => client.subscribe(instrumentSymbols, subscribeCallback), [])

  return instrumentsData
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function InstrumentReel({ instrumentSymbols }: InstrumentReelProps) {
  /**
   * ❌ Please do not edit this
   */
  const instruments = useInstruments(instrumentSymbols);

  /**
   * ✅ You can edit from here down in this component.
   * Please feel free to add more components to this file or other files if you want to.
   */

  return <div>Instrument Reel</div>;
}

export default InstrumentReel;
