import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';
import { GdgLogo } from './GdgLogo.tsx';

interface EventHeaderProps {
  onRsvpClick?: () => void;
  hasRegistration?: boolean;
  onViewPass?: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  onRsvpClick,
  hasRegistration,
  onViewPass,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="event-header-section" className="py-10 sm:py-14 lg:py-18 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Event Essentials */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200/80 rounded-full shadow-2xs">
                <GdgLogo className="h-3.5 w-auto" />
                <span>{EVENT_DATA.organizer}</span>
              </span>
              <span className="text-xs font-medium text-gray-500">
                • {EVENT_DATA.eventType} Event
              </span>
            </div>

            {/* Large Heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 text-balance">
                {EVENT_DATA.event}
              </h1>
              <p className="mt-3 text-lg sm:text-xl text-gray-600 font-normal leading-relaxed max-w-xl">
                Learn, build and explore the possibilities of AI with fellow developers.
              </p>
            </div>

            {/* Event Key Details List */}
            <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-gray-50 text-blue-600 border border-gray-100 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-medium text-gray-900">Date</span>
                  <span className="text-gray-600">{EVENT_DATA.date}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-gray-50 text-amber-600 border border-gray-100 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-medium text-gray-900">Time</span>
                  <span className="text-gray-600">{EVENT_DATA.time}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="p-2 rounded-md bg-gray-50 text-emerald-600 border border-gray-100 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-medium text-gray-900">Venue</span>
                  <span className="text-gray-600">
                    {EVENT_DATA.venue}, {EVENT_DATA.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {hasRegistration ? (
                <button
                  id="header-view-registration-btn"
                  onClick={onViewPass}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  View Your Registration
                </button>
              ) : (
                <button
                  id="header-rsvp-btn"
                  onClick={() => {
                    scrollTo('rsvp');
                    if (onRsvpClick) onRsvpClick();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-[#4285F4] hover:bg-blue-600 active:bg-blue-700 rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  <span>RSVP for this event</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                id="header-view-agenda-btn"
                onClick={() => scrollTo('agenda')}
                className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                View Agenda
              </button>
            </div>
          </div>

          {/* Right Column: Original Minimal AI & Code Event Graphic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              id="event-hero-graphic"
              className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-xs relative overflow-hidden"
            >
              {/* Top Accent bar with Google 4-color strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                <div className="w-1/4 bg-[#4285F4]"></div>
                <div className="w-1/4 bg-[#EA4335]"></div>
                <div className="w-1/4 bg-[#FBBC05]"></div>
                <div className="w-1/4 bg-[#34A853]"></div>
              </div>

              {/* Code / Developer Minimalist Visual Graphic */}
              <div className="mt-2 space-y-4">
                {/* Simulated Editor Window Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px]">build_with_ai.ts</span>
                  <div className="flex items-center gap-1.5">
                    <GdgLogo className="h-3.5 w-auto" />
                    <span className="text-[11px] font-semibold text-gray-700">GDG FIEM</span>
                  </div>
                </div>

                {/* Minimalist Code Block */}
                <div className="font-mono text-xs text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-1.5 leading-relaxed">
                  <p className="text-gray-400">// Connect, Learn & Build with Google AI</p>
                  <p>
                    <span className="text-purple-600 font-semibold">import</span> &#123; GoogleGenAI &#125;{' '}
                    <span className="text-purple-600 font-semibold">from</span>{' '}
                    <span className="text-green-700">'@google/genai'</span>;
                  </p>
                  <p>
                    <span className="text-blue-600 font-semibold">const</span> event = &#123;
                  </p>
                  <p className="pl-4">
                    name: <span className="text-green-700">"Build With AI"</span>,
                  </p>
                  <p className="pl-4">
                    chapter: <span className="text-green-700">"GDG on Campus FIEM"</span>,
                  </p>
                  <p className="pl-4">
                    date: <span className="text-amber-700">"10 October 2026"</span>,
                  </p>
                  <p className="pl-4">
                    purpose: <span className="text-green-700">"Learn. Build. Connect."</span>
                  </p>
                  <p>&#125;;</p>
                  <p className="text-blue-600 font-medium">await event.joinCommunity();</p>
                </div>

                {/* Event Tags Badges */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    Google Gemini
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                    Hands-on Lab
                  </span>
                  <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-100 font-medium">
                    Student Community
                  </span>
                  <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-100 font-medium">
                    Free Entry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
