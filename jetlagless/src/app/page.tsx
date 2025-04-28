'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { addDays, format, parse, setHours, setMinutes } from 'date-fns';

const adjustmentOptions = [
  { value: 'after-arrival', label: 'Start after arriving' },
  { value: 'on-plane', label: 'Start after leaving (on the plane)' },
  { value: 'before-departure', label: 'Start up to X days before departing' },
];

function CityAutocomplete({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    fetch(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(inputValue)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        const list = data._embedded?.['city:search-results']?.map((c: any) => c.matching_full_name) || [];
        setSuggestions(list);
        setLoading(false);
      })
      .catch(() => {
        setError('No suggestions found. Try a different city.');
        setSuggestions([]);
        setLoading(false);
      });
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium mb-2 text-[#dcddde]">{label}</label>
      <input
        type="text"
        className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d]"
        placeholder={placeholder}
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        autoComplete="off"
        required
      />
      {showSuggestions && (
        <ul className="absolute z-50 left-0 right-0 bg-[#2f3136] border border-[#202225] rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
          {loading && <li className="px-4 py-2 text-[#72767d]">Loading...</li>}
          {error && <li className="px-4 py-2 text-red-400">{error}</li>}
          {!loading && !error && suggestions.length === 0 && <li className="px-4 py-2 text-[#72767d]">No results</li>}
          {!loading && !error && suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 cursor-pointer hover:bg-[#36393f] text-[#dcddde]"
              onClick={() => {
                onChange(s);
                setInputValue(s);
                setShowSuggestions(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [arrivalDateTime, setArrivalDateTime] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('after-arrival');
  const [daysBefore, setDaysBefore] = useState(3);
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [result, setResult] = useState<any>(null);
  const [fade, setFade] = useState(false);
  const [headerRaised, setHeaderRaised] = useState(false);
  const [buttonFade, setButtonFade] = useState(false);

  const adjustmentOptions = [
    { value: 'after-arrival', label: 'Start after arriving' },
    { value: 'on-plane', label: 'Start after leaving (on the plane)' },
    { value: 'before-departure', label: 'Start up to X days before departing' },
  ];

  function nextStep() {
    setButtonFade(true);
    setTimeout(() => {
      setFade(true);
      setButtonFade(false);
      setTimeout(() => {
        setFade(false);
        setStep(s => s + 1);
      }, 400);
    }, 250);
  }

  function handleStart() {
    setHeaderRaised(true);
    nextStep();
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    // Parse input times
    const depDate = new Date(departureDateTime);
    const arrDate = new Date(arrivalDateTime);
    const usualBed = parse(bedtime, 'HH:mm', new Date());
    const usualWake = parse(waketime, 'HH:mm', new Date());
    // Calculate time zone difference in hours
    const tzDiff = Math.round((arrDate.getTime() - depDate.getTime()) / (1000 * 60 * 60));
    // Always show 5 days: 2 before, day of, 2 after
    const days = 5;
    const startDate = addDays(depDate, -2);
    // Calculate shift per day
    const shiftPerDay = Math.round(tzDiff / days * 100) / 100;
    // Build schedule
    const schedule = [];
    for (let i = 0; i < days; i++) {
      // Shift bedtime and waketime
      const bedShift = setMinutes(setHours(startDate, usualBed.getHours()), usualBed.getMinutes());
      const wakeShift = setMinutes(setHours(startDate, usualWake.getHours()), usualWake.getMinutes());
      // Apply shift
      const bedTime = addDays(bedShift, i);
      const wakeTime = addDays(wakeShift, i);
      const bedAdj = addMinutes(bedTime, Math.round(shiftPerDay * 60 * (i + 1)));
      const wakeAdj = addMinutes(wakeTime, Math.round(shiftPerDay * 60 * (i + 1)));
      schedule.push({
        day: format(addDays(startDate, i), 'EEE, MMM d'),
        bedtime: format(bedAdj, 'HH:mm'),
        waketime: format(wakeAdj, 'HH:mm'),
      });
    }
    setResult({ schedule });
    nextStep();
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh] w-full">
      {/* Persistent header */}
      <div className={`fixed left-0 right-0 top-0 z-10 flex flex-col items-center transition-all duration-500 ${headerRaised ? 'translate-y-0 pt-4 bg-[#36393f] shadow' : 'translate-y-24 pt-32'} pb-2`} style={{background: headerRaised ? '#36393f' : 'transparent'}}>
        <h1 className="text-3xl font-bold mb-2 text-[#5865f2] text-center">JetLagLess Calculator</h1>
        <p className="text-[#dcddde] text-center mb-2">Plan your sleep to beat jet lag. Enter your trip details and get a personalized 5-day schedule.</p>
      </div>
      <div className="pt-36 w-full flex flex-col items-center">
        {/* Step 0: Landing */}
        {step === 0 && (
          <div className={`w-full transition-all duration-400 ${fade ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}>
            <div className="discord-card mb-8 bg-[#36393f] pt-8 pb-8">
              <button className={`discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg mt-2 hover:bg-[#4752c4] transition-colors ${buttonFade ? 'opacity-0' : 'opacity-100'}`} onClick={handleStart}>Let's Get Started</button>
            </div>
          </div>
        )}
        {/* Step 1: Trip Info */}
        {step === 1 && (
          <div className={`w-full transition-all duration-400 ${fade ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}>
            <div className="discord-card bg-[#36393f]">
              <form onSubmit={e => { e.preventDefault(); nextStep(); }} className="space-y-6">
                <div className="flex gap-4 flex-col sm:flex-row">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-[#dcddde]">Departure City</label>
                    <input type="text" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" placeholder="Enter city name" value={departureCity} onChange={e => setDepartureCity(e.target.value)} required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-[#dcddde]">Arrival City</label>
                    <input type="text" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" placeholder="Enter city name" value={arrivalCity} onChange={e => setArrivalCity(e.target.value)} required />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-[#dcddde]">Departure Date & Time</label>
                    <input type="datetime-local" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" value={departureDateTime} onChange={e => setDepartureDateTime(e.target.value)} required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-[#dcddde]">Arrival Date & Time</label>
                    <input type="datetime-local" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" value={arrivalDateTime} onChange={e => setArrivalDateTime(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className={`discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg mt-2 hover:bg-[#4752c4] transition-colors ${buttonFade ? 'opacity-0' : 'opacity-100'}`}>Next</button>
              </form>
            </div>
          </div>
        )}
        {/* Step 2: Adjustment Preference */}
        {step === 2 && (
          <div className={`w-full transition-all duration-400 ${fade ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}>
            <div className="discord-card bg-[#36393f]">
              <form onSubmit={e => { e.preventDefault(); nextStep(); }} className="space-y-6">
                <label className="block text-sm font-medium mb-2 text-[#dcddde]">When do you want to start adjusting your sleep schedule?</label>
                <div className="space-y-2">
                  {adjustmentOptions.map(opt => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={opt.value}
                        name="adjustmentType"
                        value={opt.value}
                        checked={adjustmentType === opt.value}
                        onChange={() => setAdjustmentType(opt.value)}
                      />
                      <label htmlFor={opt.value} className="text-[#dcddde]">{opt.label}</label>
                      {opt.value === 'before-departure' && adjustmentType === 'before-departure' && (
                        <input
                          type="number"
                          min={1}
                          max={14}
                          className="discord-input w-20 ml-2 bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]"
                          value={daysBefore}
                          onChange={e => setDaysBefore(Number(e.target.value))}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className={`discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg mt-2 hover:bg-[#4752c4] transition-colors ${buttonFade ? 'opacity-0' : 'opacity-100'}`}>Next</button>
              </form>
            </div>
          </div>
        )}
        {/* Step 3: Sleep Times */}
        {step === 3 && (
          <div className={`w-full transition-all duration-400 ${fade ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}>
            <div className="discord-card bg-[#36393f]">
              <form onSubmit={handleCalculate} className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-[#dcddde]">Usual Bedtime</label>
                    <input type="time" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" value={bedtime} onChange={e => setBedtime(e.target.value)} required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-[#dcddde]">Usual Wake-up Time</label>
                    <input type="time" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" value={waketime} onChange={e => setWaketime(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className={`discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg mt-2 hover:bg-[#4752c4] transition-colors ${buttonFade ? 'opacity-0' : 'opacity-100'}`}>Calculate 5-Day Schedule</button>
              </form>
            </div>
          </div>
        )}
        {/* Step 4: Results */}
        {result && step === 4 && (
          <div className="discord-card mt-8 bg-[#36393f]">
            <h2 className="text-xl font-semibold mb-4 text-[#5865f2]">Your 5-Day Jet Lag Plan</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-[#5865f2]">Day</th>
                    <th className="px-4 py-2 text-[#5865f2]">Bedtime</th>
                    <th className="px-4 py-2 text-[#5865f2]">Wake-up</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row: any, idx: number) => (
                    <tr key={idx} className="bg-[#36393f] rounded">
                      <td className="px-4 py-2 font-semibold text-[#dcddde]">{row.day}</td>
                      <td className="px-4 py-2 text-[#dcddde]">{row.bedtime}</td>
                      <td className="px-4 py-2 text-[#dcddde]">{row.waketime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper for minute shifting
function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
