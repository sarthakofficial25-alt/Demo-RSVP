import React from 'react';
import { X, Calendar, Clock, MapPin, Printer, CalendarPlus, Copy, Check, CheckCircle2, Database } from 'lucide-react';
import { EVENT_DATA, Registration } from '../data/eventData.ts';
import { GdgLogo } from './GdgLogo.tsx';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onPrint: () => void;
  onAddToCalendar: () => void;
  showToast: (msg: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  registration,
  onPrint,
  onAddToCalendar,
  showToast,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !registration) return null;

  const copyId = () => {
    navigator.clipboard.writeText(registration.registrationId);
    setCopied(true);
    showToast('Registration ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="registration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs no-print"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Google Colors Accent */}
        <div className="h-1.5 flex">
          <div className="w-1/4 bg-[#4285F4]"></div>
          <div className="w-1/4 bg-[#EA4335]"></div>
          <div className="w-1/4 bg-[#FBBC05]"></div>
          <div className="w-1/4 bg-[#34A853]"></div>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">
              Registration Pass
            </h3>
          </div>
          <button
            id="close-registration-modal-btn"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Event & Reg ID */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <GdgLogo className="h-3.5 w-auto" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block">
                  {EVENT_DATA.organizer}
                </span>
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                {EVENT_DATA.event}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <div>
                <span className="text-[9px] uppercase font-mono text-gray-700 block">
                  REG ID
                </span>
                <span className="font-mono text-xs font-bold text-gray-900">
                  {registration.registrationId}
                </span>
              </div>
              <button
                type="button"
                onClick={copyId}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="Copy ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
            <div>
              <span className="text-xs text-gray-700 block">Participant</span>
              <span className="font-semibold text-gray-900">{registration.fullName}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-xs text-gray-700 block">Email</span>
                <span className="font-medium text-gray-800 break-all">{registration.email}</span>
              </div>
              <div>
                <span className="text-xs text-gray-700 block">Phone</span>
                <span className="font-medium text-gray-800">{registration.phone}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-xs text-gray-700 block">College / Organization</span>
              <span className="font-medium text-gray-800">{registration.organization}</span>
            </div>
          </div>

          {/* Event Schedule Info */}
          <div className="space-y-2 text-xs text-gray-600 pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{EVENT_DATA.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{EVENT_DATA.time}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{EVENT_DATA.venue}, {EVENT_DATA.city}</span>
            </div>
          </div>

          {/* Firestore Status Badge */}
          <div className="pt-2 text-[11px] text-gray-500 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Saved in Firebase Firestore</span>
            </div>
            <span className="font-mono text-gray-500">Status: Confirmed</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onAddToCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add to Calendar</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>Print Pass</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
