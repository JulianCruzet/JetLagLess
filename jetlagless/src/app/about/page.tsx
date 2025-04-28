import * as React from 'react';

export default function About() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="discord-card">
        <h1 className="text-3xl font-bold mb-4 text-[#5865f2]">About JetLagLess</h1>
        <p className="mb-4 text-[#dcddde]">
          <strong>JetLagLess</strong> helps you minimize jet lag by calculating the optimal sleep schedule for your flight. Based on research-backed methods, it suggests when to sleep and provides tips to help your body clock adjust to new time zones.
        </p>
        <h2 className="text-xl font-semibold mb-2 text-[#5865f2]">How does it work?</h2>
        <ul className="list-disc list-inside mb-4 text-[#dcddde]">
          <li>Enter your departure and arrival times, and the time zone difference.</li>
          <li>Get a recommended sleep window for your flight.</li>
          <li>Follow the personalized tips to reduce jet lag symptoms.</li>
        </ul>
        <h2 className="text-xl font-semibold mb-2 text-[#5865f2]">Why use JetLagLess?</h2>
        <ul className="list-disc list-inside text-[#dcddde]">
          <li>Arrive refreshed and ready for your destination.</li>
          <li>Reduce fatigue, grogginess, and sleep disruption.</li>
          <li>Based on proven circadian science and travel best practices.</li>
        </ul>
      </div>
    </div>
  );
} 