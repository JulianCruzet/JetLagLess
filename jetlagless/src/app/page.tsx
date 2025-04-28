'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { addDays, format, parse, setHours, setMinutes } from 'date-fns';
import Image from 'next/image';

const adjustmentOptions = [
  { value: 'after-arrival', label: 'Start after arriving' },
  { value: 'on-plane', label: 'Start after leaving (on the plane)' },
  { value: 'before-departure', label: 'Start up to X days before departing' },
];

const majorCities = [
  // North America
  "New York, USA (JFK/LaGuardia)",
  "Los Angeles, USA (LAX)",
  "Chicago, USA (O'Hare)",
  "Toronto, Canada (Pearson)",
  "Vancouver, Canada (YVR)",
  "San Francisco, USA (SFO)",
  "Miami, USA (MIA)",
  "Seattle, USA (SEA)",
  "Boston, USA (Logan)",
  "Washington DC, USA (Dulles)",
  "Houston, USA (Bush)",
  "Dallas, USA (DFW)",
  "Atlanta, USA (Hartsfield-Jackson)",
  "Denver, USA (DIA)",
  "Montreal, Canada (Trudeau)",
  "Calgary, Canada (YYC)",
  
  // Europe
  "London, UK (Heathrow/Gatwick)",
  "Paris, France (Charles de Gaulle)",
  "Amsterdam, Netherlands (Schiphol)",
  "Frankfurt, Germany (FRA)",
  "Madrid, Spain (Barajas)",
  "Rome, Italy (Fiumicino)",
  "Istanbul, Turkey (IST)",
  "Moscow, Russia (Sheremetyevo)",
  "Munich, Germany (MUC)",
  "Barcelona, Spain (El Prat)",
  "Zurich, Switzerland (ZRH)",
  "Vienna, Austria (VIE)",
  "Stockholm, Sweden (Arlanda)",
  "Copenhagen, Denmark (CPH)",
  "Dublin, Ireland (DUB)",
  "Lisbon, Portugal (LIS)",
  
  // Asia
  "Tokyo, Japan (Narita/Haneda)",
  "Singapore, Singapore (Changi)",
  "Hong Kong, China (HKG)",
  "Seoul, South Korea (Incheon)",
  "Bangkok, Thailand (Suvarnabhumi)",
  "Dubai, UAE (DXB)",
  "Abu Dhabi, UAE (AUH)",
  "Doha, Qatar (Hamad)",
  "Shanghai, China (Pudong)",
  "Beijing, China (Capital)",
  "Mumbai, India (Chhatrapati Shivaji)",
  "Delhi, India (Indira Gandhi)",
  "Kuala Lumpur, Malaysia (KUL)",
  "Manila, Philippines (Ninoy Aquino)",
  "Jakarta, Indonesia (Soekarno-Hatta)",
  "Taipei, Taiwan (Taoyuan)",
  
  // Oceania
  "Sydney, Australia (Kingsford Smith)",
  "Melbourne, Australia (Tullamarine)",
  "Auckland, New Zealand (AKL)",
  "Brisbane, Australia (BNE)",
  "Perth, Australia (PER)",
  
  // South America
  "São Paulo, Brazil (Guarulhos)",
  "Rio de Janeiro, Brazil (Galeão)",
  "Buenos Aires, Argentina (Ezeiza)",
  "Santiago, Chile (Arturo Merino Benítez)",
  "Lima, Peru (Jorge Chávez)",
  "Bogotá, Colombia (El Dorado)",
  
  // Africa
  "Johannesburg, South Africa (O.R. Tambo)",
  "Cairo, Egypt (CAI)",
  "Nairobi, Kenya (Jomo Kenyatta)",
  "Addis Ababa, Ethiopia (Bole)",
  "Casablanca, Morocco (Mohammed V)",
  "Lagos, Nigeria (Murtala Muhammed)"
];

function CityAutocomplete({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showNote, setShowNote] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowNote(false);
      return;
    }
    
    const filteredCities = majorCities.filter(city => 
      city.toLowerCase().includes(inputValue.toLowerCase())
    );
    setSuggestions(filteredCities);
    setShowNote(filteredCities.length === 0);
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
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 bg-[#2f3136] border border-[#202225] rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
          {suggestions.map((s, i) => (
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
      {showNote && (
        <p className="text-sm text-[#72767d] mt-1">
          Please select a major city with an international airport from the list above.
        </p>
      )}
    </div>
  );
}

function VerticalProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { title: "Start", icon: "🚀" },
    { title: "Trip Details", icon: "✈️" },
    { title: "Adjustment", icon: "⏰" },
    { title: "Sleep Schedule", icon: "😴" },
    { title: "Results", icon: "📅" }
  ];

  return (
    <div className="absolute -left-72 top-1/2 transform -translate-y-1/2 hidden lg:block">
      <div className="relative h-[400px] flex flex-col justify-between">
        <div className="absolute top-0 bottom-0 left-[20px] w-0.5 bg-[#40444b] -z-10">
          <div 
            className="bg-[#5865f2] transition-all duration-300"
            style={{ 
              height: `${(currentStep / (steps.length - 1)) * 100}%`,
              width: '100%'
            }}
          />
        </div>
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
              index === currentStep 
                ? 'bg-[#5865f2] text-white scale-110' 
                : index < currentStep 
                  ? 'bg-[#5865f2] text-white' 
                  : 'bg-[#40444b] text-[#72767d]'
            }`}>
              {step.icon}
            </div>
            <div className={`ml-4 transition-all duration-300 ${
              index === currentStep 
                ? 'text-[#5865f2] font-medium' 
                : index < currentStep 
                  ? 'text-[#dcddde]' 
                  : 'text-[#72767d]'
            }`}>
              {step.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WumpusGif() {
  return (
    <div className="absolute -right-96 top-1/2 transform -translate-y-1/2 hidden lg:block">
      <Image
        src="/wumpus-sleeping.gif"
        alt="Sleeping Wumpus"
        width={250}
        height={250}
        className="rounded-lg"
      />
    </div>
  );
}

interface ScheduleDay {
  day: string;
  bedtime: string;
  waketime: string;
}

interface TimeZoneInfo {
  departureCity: string;
  arrivalCity: string;
  timeDifference: number;
  direction: string;
}

interface Result {
  schedule: ScheduleDay[];
  timeZoneInfo: TimeZoneInfo;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [arrivalDateTime, setArrivalDateTime] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('after-arrival');
  const [daysBefore, setDaysBefore] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const [landingFade, setLandingFade] = useState(false);
  const [showStep1, setShowStep1] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const sectionTitles = {
    0: {
      title: "JetLagLess Calculator",
      subtitle: "Plan your sleep to beat jet lag. Enter your trip details and get a personalized 5-day schedule."
    },
    1: {
      title: "Trip Details",
      subtitle: "Enter your departure and arrival information to calculate the optimal sleep schedule."
    },
    2: {
      title: "Adjustment Preference",
      subtitle: "Choose when you'd like to start adjusting your sleep schedule."
    },
    3: {
      title: "Sleep Schedule",
      subtitle: "Enter your usual sleep times to help us create a personalized schedule."
    },
    4: {
      title: "Your Jet Lag Schedule",
      subtitle: "Here's your personalized 5-day schedule to minimize jet lag."
    }
  };

  // Animation classes
  const fadeUpAnimation = `
    @keyframes fadeUpIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeUpOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    .fade-up-animate {
      animation: fadeUpIn 0.5s ease-out forwards;
    }
    .fade-up-out {
      animation: fadeUpOut 0.5s ease-out forwards;
    }
    /* Remove spinner arrows from number input */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }
  `;

  function nextStep() {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      setStep(step + 1);
    }, 500);
  }

  function handleStart() {
    setLandingFade(true);
    setTimeout(() => {
      setShowTitle(false);
      setShowStep1(true);
      setTimeout(() => {
        nextStep();
      }, 10);
    }, 500);
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
    
    // Determine start date based on adjustment preference
    let startDate: Date;
    switch (adjustmentType) {
      case 'after-arrival':
        startDate = arrDate;
        break;
      case 'on-plane':
        startDate = depDate;
        break;
      case 'before-departure':
        const daysBeforeNum = parseInt(daysBefore) || 0;
        startDate = addDays(depDate, -daysBeforeNum);
        break;
      default:
        startDate = depDate;
    }
    
    // Always show 5 days
    const days = 5;
    
    // Calculate shift per day
    const shiftPerDay = Math.round(tzDiff / days * 100) / 100;
    
    // Build schedule
    const schedule: ScheduleDay[] = [];
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
    
    setResult({ 
      schedule,
      timeZoneInfo: {
        departureCity,
        arrivalCity,
        timeDifference: tzDiff,
        direction: tzDiff > 0 ? 'ahead' : 'behind'
      }
    });
    nextStep();
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh] w-full relative">
      <div className="w-full max-w-2xl mx-auto relative">
        <WumpusGif />
        <VerticalProgress currentStep={step} />
        <style>{fadeUpAnimation}</style>
        <div className="w-full flex flex-col items-center">
          {/* Title and Subtitle - Only visible on landing page */}
          {step === 0 && showTitle && (
            <div className={`w-full flex flex-col items-center transition-all duration-500 ease-in-out ${landingFade ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'} py-16`}>
              <div className="w-full space-y-1">
                <h1 className="text-3xl font-bold text-[#5865f2] text-center">{sectionTitles[0].title}</h1>
                <p className="text-[#dcddde] text-center mt-2">{sectionTitles[0].subtitle}</p>
              </div>
              <div className="discord-card mb-8 bg-[#36393f] pt-6 pb-6 w-full">
                <button 
                  className="discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg hover:bg-[#4752c4] transition-all duration-300"
                  onClick={handleStart}
                >
                  Let&apos;s Get Started
                </button>
              </div>
            </div>
          )}
          {/* Step 1: Trip Info */}
          {showStep1 && step === 1 && (
            <div key="trip-details" className={`w-full ${isAnimatingOut ? 'fade-up-out' : 'fade-up-animate'} py-16`}>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#5865f2] text-center">{sectionTitles[1].title}</h1>
                <p className="text-[#dcddde] text-center mt-2">{sectionTitles[1].subtitle}</p>
              </div>
              <div className="discord-card bg-[#36393f]">
                <form onSubmit={e => { e.preventDefault(); nextStep(); }} className="space-y-6">
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <div className="flex-1">
                      <CityAutocomplete
                        value={departureCity}
                        onChange={setDepartureCity}
                        label="Departure City"
                        placeholder="Enter city name"
                      />
                    </div>
                    <div className="flex-1">
                      <CityAutocomplete
                        value={arrivalCity}
                        onChange={setArrivalCity}
                        label="Arrival City"
                        placeholder="Enter city name"
                      />
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
                  <button type="submit" className="discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg hover:bg-[#4752c4] transition-all duration-300">Next</button>
                </form>
              </div>
            </div>
          )}
          {/* Step 2: Adjustment Preference */}
          {step === 2 && (
            <div key="adjustment-preference" className={`w-full ${isAnimatingOut ? 'fade-up-out' : 'fade-up-animate'} py-16`}>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#5865f2] text-center">{sectionTitles[2].title}</h1>
                <p className="text-[#dcddde] text-center mt-2">{sectionTitles[2].subtitle}</p>
              </div>
              <div className="discord-card bg-[#36393f]">
                <form onSubmit={e => { e.preventDefault(); nextStep(); }} className="space-y-6">
                  <div className="space-y-3">
                    {adjustmentOptions.map(opt => (
                      <div 
                        key={opt.value}
                        onClick={() => setAdjustmentType(opt.value)}
                        className={`p-4 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-between
                          ${adjustmentType === opt.value 
                            ? 'bg-[#5865f2] text-white' 
                            : 'bg-[#40444b] text-[#dcddde] hover:bg-[#454950]'}`}
                      >
                        <span className="flex-1">{opt.label}</span>
                        {opt.value === 'before-departure' && adjustmentType === 'before-departure' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Days:</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="w-16 px-2 py-1 bg-[#36393f] text-white text-center rounded border border-[#202225] focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
                              value={daysBefore}
                              placeholder=""
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                // Allow only numbers or blank
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                  setDaysBefore(val);
                                }
                              }}
                              onBlur={e => {
                                // Optionally, validate or reset on blur
                                if (e.target.value && !/^\d+$/.test(e.target.value)) {
                                  setDaysBefore('');
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg hover:bg-[#4752c4] transition-all duration-300">Next</button>
                </form>
              </div>
            </div>
          )}
          {/* Step 3: Usual Sleep Schedule */}
          {step === 3 && (
            <div key="sleep-schedule" className={`w-full ${isAnimatingOut ? 'fade-up-out' : 'fade-up-animate'} py-16`}>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#5865f2] text-center">{sectionTitles[3].title}</h1>
                <p className="text-[#dcddde] text-center mt-2">{sectionTitles[3].subtitle}</p>
              </div>
              <div className="discord-card bg-[#36393f]">
                <form onSubmit={handleCalculate} className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2 text-[#dcddde]">Usual Bedtime</label>
                      <input type="time" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" value={bedtime} onChange={e => setBedtime(e.target.value)} required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2 text-[#dcddde]">Usual Wake Time</label>
                      <input type="time" className="discord-input w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] border-[#202225]" value={waketime} onChange={e => setWaketime(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="discord-button w-full bg-[#5865f2] text-white font-bold py-3 text-lg hover:bg-[#4752c4] transition-all duration-300">Calculate Schedule</button>
                </form>
              </div>
            </div>
          )}
          {/* Step 4: Results */}
          {step === 4 && result && (
            <div key="results" className={`w-full ${isAnimatingOut ? 'fade-up-out' : 'fade-up-animate'}`}>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#5865f2] text-center">{sectionTitles[4].title}</h1>
                <p className="text-[#dcddde] text-center mt-2">{sectionTitles[4].subtitle}</p>
              </div>
              <div className="discord-card bg-[#36393f]">
                <div className="space-y-4">
                  <div className="bg-[#40444b] p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-[#72767d] text-xs">Departure</p>
                        <p className="text-[#dcddde] font-medium">{result.timeZoneInfo.departureCity}</p>
                      </div>
                      <div className="flex items-center justify-center w-12">
                        <span className="text-[#5865f2] text-2xl font-bold">
                          {result.timeZoneInfo.timeDifference > 0 ? '⟶' : '⟵'}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-[#72767d] text-xs">Arrival</p>
                        <p className="text-[#dcddde] font-medium">{result.timeZoneInfo.arrivalCity}</p>
                      </div>
                    </div>
                    <p className="text-[#dcddde] text-center mt-2">
                      <span className="text-[#5865f2] font-semibold">{Math.abs(result.timeZoneInfo.timeDifference)} hours</span>{" "}
                      {result.timeZoneInfo.direction}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {result.schedule.map((day: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-[#40444b] rounded-md">
                        <span className="text-[#dcddde] font-medium">{day.day}</span>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <span className="text-[#72767d] text-xs block">Bedtime</span>
                            <span className="text-[#dcddde]">{day.bedtime}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[#72767d] text-xs block">Wake Time</span>
                            <span className="text-[#dcddde]">{day.waketime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setStep(0);
                      setShowTitle(true);
                      setShowStep1(false);
                      setLandingFade(false);
                      setResult(null);
                      setDepartureCity('');
                      setArrivalCity('');
                      setDepartureDateTime('');
                      setArrivalDateTime('');
                      setAdjustmentType('after-arrival');
                      setDaysBefore('');
                      setBedtime('');
                      setWaketime('');
                    }} 
                    className="discord-button w-full bg-[#5865f2] text-white font-bold py-2.5 text-lg hover:bg-[#4752c4] transition-colors"
                  >
                    Start Over
                  </button>

                  <p className="text-[#72767d] text-xs text-center">
                    All times shown are in the local time zone of {arrivalCity}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper for minute shifting
function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
