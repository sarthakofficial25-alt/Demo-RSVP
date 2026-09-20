import React from 'react';
import { BookOpen, Code2, Users } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';

export const Highlights: React.FC = () => {
  const icons = [
    <BookOpen className="w-6 h-6 text-[#4285F4]" />,
    <Code2 className="w-6 h-6 text-[#34A853]" />,
    <Users className="w-6 h-6 text-[#EA4335]" />,
  ];

  return (
    <section id="what-to-expect" className="py-14 sm:py-20 bg-gray-50 border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {EVENT_DATA.tagline}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            What to expect
          </h2>
          <p className="mt-3 text-base text-gray-600">
            A single day packed with practical knowledge, coding demonstrations, and community connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {EVENT_DATA.highlights.map((item, index) => (
            <div
              key={item.title}
              id={`highlight-card-${item.title.toLowerCase()}`}
              className="bg-white p-7 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors flex flex-col"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                style={{ backgroundColor: `${item.accent}12` }}
              >
                {icons[index]}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed grow">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
