import React from 'react';
import { Mic, User } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';

export const Speakers: React.FC = () => {
  return (
    <section id="speakers" className="py-14 sm:py-20 bg-gray-50 border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-full mb-3">
            <Mic className="w-3.5 h-3.5 text-blue-600" />
            Session Leaders
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Speakers
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Meet the engineers and community leaders conducting sessions at Build With AI.
          </p>
        </div>

        {/* 4 Simple Speaker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENT_DATA.speakers.map((speaker) => (
            <div
              key={speaker.id}
              id={`speaker-card-${speaker.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs hover:border-gray-300 transition-colors flex flex-col text-center items-center"
            >
              {/* Circular Avatar */}
              <div className="relative mb-4">
                <img
                  src={speaker.avatar}
                  alt={speaker.name}
                  loading="lazy"
                  className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-xs"
                  onError={(e) => {
                    // Fallback to SVG placeholder if offline or network fails
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  style={{ display: 'none' }}
                  className="w-24 h-24 rounded-full bg-blue-100 border-2 border-white text-blue-700 items-center justify-center font-bold text-xl shadow-xs"
                >
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              {/* Name & Role */}
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {speaker.name}
              </h3>
              <p className="text-xs font-medium text-blue-700 mt-0.5">
                {speaker.role}
              </p>

              {/* Session Details */}
              <div className="mt-4 pt-3 border-t border-gray-100 w-full text-left">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block">
                  Session
                </span>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {speaker.session}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
