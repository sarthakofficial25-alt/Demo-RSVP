import React from 'react';
import { Sparkles, Users, CheckCircle2 } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-14 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            About this event
          </h2>
        </div>

        {/* 2-3 Concise Paragraphs */}
        <div className="space-y-5 text-base sm:text-lg text-gray-700 leading-relaxed">
          {EVENT_DATA.about.map((paragraph, index) => (
            <p key={index} className="text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Who Can Attend - Clean & Simple */}
        <div
          id="who-can-attend"
          className="mt-12 p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {EVENT_DATA.whoCanAttend.title}
            </h3>
          </div>

          <p className="text-gray-700 text-base leading-relaxed mb-4">
            {EVENT_DATA.whoCanAttend.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {EVENT_DATA.whoCanAttend.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
