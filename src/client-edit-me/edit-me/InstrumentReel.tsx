/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import { useEffect, useState, useCallback, useRef } from 'react';
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
  const instrumentsContainer = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)


  const getChangeColor = (percentage: number) => {
    if(percentage < 0) return 'percentageDown';
    if(percentage > 0) return 'percentageUp';
    return '';
  }

  const getInstrumentElements = (isHidden: boolean = false) => {
    return instruments?.map((value) => {
      const valueChangeColor = getChangeColor(value.percentageChange);
      return (
        <li className='instrument' aria-hidden={isHidden} key={value.code}>
          <img src={`/${value.category}/${value.code}.svg`} alt={`${value.code} logo`} className='logo' />
          <p>{value.name}</p>
          <p className={valueChangeColor}>{value.lastQuote}</p>
          <p className={valueChangeColor}>{`${value.percentageChange > 0 ? '+' : '-'} ${Math.abs(value.percentageChange ).toFixed(3)}%`}</p>
        </li>
      )
    })
  }

  useEffect(() => {
    const handleIsOverflow = () => {
      setIsOverflowing((instrumentsContainer.current?.clientWidth ?? 0) < (instrumentsContainer.current?.scrollWidth ?? 0));
    };

    handleIsOverflow();

    window.addEventListener("resize", handleIsOverflow);

    return () => {
      window.removeEventListener("resize", handleIsOverflow);
    };
  }, [instrumentsContainer.current]);

  if(!instruments) return <p>Loading...</p>

  return (
  <div className='instruments' ref={instrumentsContainer}>
    <ul className={isOverflowing ? 'slider animate' : 'slider'}>
      {getInstrumentElements() }
      {isOverflowing ? getInstrumentElements(true) : null}
    </ul>
  </div>
  )
}

export default InstrumentReel;
