import React from 'react';
import { Calendar, Clock, UserCheck } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';

export const Agenda: React.FC = () => {
  return (
    <section id="agenda" className="py-14 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-full mb-3">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Schedule
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Agenda
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Saturday, 10 October 2026 • Single-day event schedule from 10:00 AM to 5:00 PM IST
          </p>
        </div>

        {/* Simple Vertical Timeline */}
        <div className="relative border-l-2 border-gray-200 ml-4 sm:ml-32 space-y-8">
          {EVENT_DATA.agenda.map((item, index) => {
            const isWorkshop = item.title.toLowerCase().includes('workshop');
            const isBreak = item.title.toLowerCase().includes('lunch');

            return (
              <div
                key={index}
                id={`agenda-item-${index}`}
                className="relative pl-6 sm:pl-8 group"
              >
                {/* Timeline node marker */}
                <div
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                    isWorkshop
                      ? 'border-[#4285F4] bg-blue-500'
                      : isBreak
                      ? 'border-[#FBBC05] bg-amber-400'
                      : index === 0 || index === EVENT_DATA.agenda.length - 1
                      ? 'border-[#34A853] bg-green-500'
                      : 'border-gray-400 group-hover:border-[#4285F4]'
                  } transition-colors`}
                ></div>

                {/* Desktop Left-aligned Time Badge */}
                <div className="hidden sm:block absolute -left-32 top-0.5 w-24 text-right">
                  <span className="font-mono text-sm font-semibold text-gray-800 tracking-tight">
                    {item.time}
                  </span>
                </div>

                {/* Session Card Content */}
                <div
                  className={`p-4 sm:p-5 rounded-lg border ${
                    isWorkshop
                      ? 'bg-blue-50/40 border-blue-100'
                      : isBreak
                      ? 'bg-amber-50/30 border-amber-100'
                      : 'bg-white border-gray-200/80 hover:border-gray-300'
                  } transition-colors`}
                >
                  {/* Mobile Time Badge */}
                  <div className="sm:hidden flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-700 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.time}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                    {item.tag && (
                      <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm sm:text-base text-gray-600 leading-relaxed">
                    {item.description}
                  </p>

                  {item.speaker && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Led by {item.speaker}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note at bottom of agenda */}
        <div className="mt-10 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>All sessions take place in the FIEM Main Auditorium & Computing Lab.</span>
        </div>
      </div>
    </section>
  );
};
