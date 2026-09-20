import React from 'react';
import { MapPin, Navigation, Compass, Building, Train } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';

export const Venue: React.FC = () => {
  return (
    <section id="venue" className="py-14 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-full mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Location
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Where
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Join us in-person on campus in Kolkata.
          </p>
        </div>

        {/* Venue Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Details Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-blue-600 shadow-2xs shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {EVENT_DATA.venue}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {EVENT_DATA.address}
                  </p>
                </div>
              </div>

              {/* Transit & Accessibility Guide */}
              <div className="pt-4 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2.5">
                  <Train className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Transit:</strong> Near Sonarpur Railway Junction (South 24 Parganas, Kolkata suburban). Auto-rickshaws and buses available from Kavi Subhash Metro Station.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hall:</strong> Main Engineering Block Auditorium & Ground Floor Computing Center.
                  </span>
                </div>
              </div>
            </div>

            {/* Directions Button */}
            <div className="pt-4 border-t border-gray-200">
              <a
                id="get-directions-btn"
                href={EVENT_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#4285F4] hover:bg-blue-600 active:bg-blue-700 rounded-md transition-colors shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-7 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 min-h-[340px] flex flex-col relative shadow-xs">
            {/* Embedded Clean Google Map View without API key */}
            <iframe
              title="Event Venue Map"
              src="https://maps.google.com/maps?q=Future+Institute+of+Engineering+and+Management+Kolkata&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[340px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            {/* Map overlay card */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-gray-200 shadow-xs text-xs">
              <span className="font-semibold text-gray-900 block">FIEM Campus</span>
              <span className="text-gray-500">Sonarpur, Kolkata</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
