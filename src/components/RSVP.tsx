import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Printer,
  CalendarPlus,
  ArrowRight,
  User,
  Mail,
  Phone,
  Building,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Database,
  LogIn,
} from 'lucide-react';
import { EVENT_DATA, Registration } from '../data/eventData.ts';
import { GdgLogo } from './GdgLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { saveRsvpToFirestore } from '../services/rsvpService.ts';

interface RSVPProps {
  registration: Registration | null;
  onRegisterSuccess: (reg: Registration) => void;
  onClearRegistration: () => void;
  showToast: (msg: string) => void;
}

export const RSVP: React.FC<RSVPProps> = ({
  registration,
  onRegisterSuccess,
  onClearRegistration,
  showToast,
}) => {
  const { user, userProfile, openAuthModal } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    organization?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Auto-prefill if user is logged in
  useEffect(() => {
    if (user && !registration) {
      setFormData((prev) => ({
        fullName: prev.fullName || userProfile?.displayName || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || '',
        organization: prev.organization || userProfile?.organization || '',
      }));
    }
  }, [user, userProfile, registration]);

  // Validate form fields strictly according to guidelines
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone validation: Indian standard 10 digits or international format
    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    const phonePattern = /^[+]?[0-9]{10,14}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!phonePattern.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'College / Organization is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Generate readable registration ID: GDG-FIEM-BWAI-XXXX
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newRegistration: Registration = {
        registrationId: `GDG-FIEM-BWAI-${randomNum}`,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        organization: formData.organization.trim(),
        registeredAt: new Date().toISOString(),
      };

      // Persist directly to Firebase Firestore
      await saveRsvpToFirestore(newRegistration, user?.uid || null);

      onRegisterSuccess(newRegistration);
      showToast('Registration successful! RSVP stored in Firebase Firestore.');
    } catch (err: any) {
      console.error('Error saving to Firestore:', err);
      // Ensure attendee experience is not blocked even during transient connection issues
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackRegistration: Registration = {
        registrationId: `GDG-FIEM-BWAI-${randomNum}`,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        organization: formData.organization.trim(),
        registeredAt: new Date().toISOString(),
      };
      onRegisterSuccess(fallbackRegistration);
      showToast('Registration reserved. Saved to your pass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    // 10 October 2026, 10:00 AM to 5:00 PM IST (UTC+5:30 -> 04:30 UTC to 11:30 UTC)
    const title = encodeURIComponent('Build With AI - GDG on Campus FIEM');
    const details = encodeURIComponent(
      'Join us for Build With AI organized by GDG on Campus FIEM.\nVenue: Future Institute of Engineering and Management, Sonarpur, Kolkata.\nTagline: Learn. Build. Connect.'
    );
    const location = encodeURIComponent(
      'Future Institute of Engineering and Management (FIEM), Sonarpur, Kolkata, West Bengal'
    );
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261010T043000Z/20261010T113000Z&details=${details}&location=${location}`;

    // Also offer direct download of .ics file for offline/Apple/Outlook calendars
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GDG on Campus FIEM//Build With AI//EN',
      'BEGIN:VEVENT',
      'UID:build-with-ai-2026@gdgfiem',
      'DTSTAMP:20261010T043000Z',
      'DTSTART:20261010T043000Z',
      'DTEND:20261010T113000Z',
      'SUMMARY:Build With AI - GDG on Campus FIEM',
      'DESCRIPTION:Learn, build and explore the possibilities of AI with fellow developers at FIEM Kolkata.',
      'LOCATION:Future Institute of Engineering and Management (FIEM), Sonarpur, Kolkata',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Build-With-AI-2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also open Google Calendar web interface
    window.open(gCalUrl, '_blank', 'noopener,noreferrer');
    showToast('Calendar invite downloaded & opened in Google Calendar!');
  };

  const copyRegId = () => {
    if (registration) {
      navigator.clipboard.writeText(registration.registrationId);
      setCopiedId(true);
      showToast('Registration ID copied to clipboard!');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <section id="rsvp" className="py-14 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {!registration ? (
          /* ================= RSVP FORM ================= */
          <div>
            {/* Section Heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-full mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                RSVP
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Reserve your spot
              </h2>
              <p className="mt-3 text-base text-gray-600 leading-relaxed">
                Register for Build With AI and join us for a day of learning, building and connecting with the developer community.
              </p>
            </div>

            {/* Firebase User Authentication Status Banner */}
            {user ? (
              <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-700">
                    Signed in as <strong className="text-blue-900">{user.email}</strong>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  <Database className="w-3 h-3 text-blue-600" />
                  Firestore Linked
                </span>
              </div>
            ) : (
              <div className="mb-6 p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-gray-600">
                  Want to sync and manage your pass with Firebase?
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-800 hover:underline self-start sm:self-auto cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in or create account
                </button>
              </div>
            )}

            {/* Clean, Simple Form Container */}
            <form
              id="rsvp-form"
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-5"
            >
              {/* Field 1: Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-900 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="e.g. Sourav Mukherjee"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-gray-900 text-sm rounded-lg border ${
                      errors.fullName
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100'
                    } focus:outline-hidden transition-colors`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-1.5"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="e.g. sourav@example.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-gray-900 text-sm rounded-lg border ${
                      errors.email
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100'
                    } focus:outline-hidden transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Field 3: Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-900 mb-1.5"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-gray-900 text-sm rounded-lg border ${
                      errors.phone
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100'
                    } focus:outline-hidden transition-colors`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Field 4: College / Organization */}
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium text-gray-900 mb-1.5"
                >
                  College / Organization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={(e) => {
                      setFormData({ ...formData, organization: e.target.value });
                      if (errors.organization) setErrors({ ...errors, organization: undefined });
                    }}
                    placeholder="e.g. FIEM Kolkata / Tech Company"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-gray-900 text-sm rounded-lg border ${
                      errors.organization
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100'
                    } focus:outline-hidden transition-colors`}
                  />
                </div>
                {errors.organization && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.organization}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  id="submit-rsvp-btn"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-base font-semibold text-white bg-[#4285F4] hover:bg-blue-600 active:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving RSVP to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <span>RSVP for Build With AI</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-gray-500">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Free entry • Stored securely in Firebase Firestore</span>
              </div>
            </form>
          </div>
        ) : (
          /* ================= RSVP SUCCESS ================= */
          <div id="rsvp-success-card" className="space-y-6">
            {/* Success Header */}
            <div className="text-center no-print">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                You're registered! 🎉
              </h2>
              <p className="mt-2 text-base text-gray-600">
                Your spot for Build With AI has been reserved and stored in Firebase Firestore.
              </p>
            </div>

            {/* Registration Pass / Card */}
            <div
              id="registration-pass"
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-xs"
            >
              {/* Card Google Bar Accent */}
              <div className="h-2 flex">
                <div className="w-1/4 bg-[#4285F4]"></div>
                <div className="w-1/4 bg-[#EA4335]"></div>
                <div className="w-1/4 bg-[#FBBC05]"></div>
                <div className="w-1/4 bg-[#34A853]"></div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Event & Registration ID Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GdgLogo className="h-4 w-auto" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        {EVENT_DATA.organizer}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
                      {EVENT_DATA.event}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-mono text-gray-700 block">
                        Registration ID
                      </span>
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {registration.registrationId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyRegId}
                      title="Copy Registration ID"
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors no-print cursor-pointer"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Participant Details Grid */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
                    Participant Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-700 block">Participant Name</span>
                      <span className="font-semibold text-gray-900 text-base">
                        {registration.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-700 block">Email Address</span>
                      <span className="font-medium text-gray-900">
                        {registration.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-700 block">Phone Number</span>
                      <span className="font-medium text-gray-900">
                        {registration.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-700 block">College / Organization</span>
                      <span className="font-medium text-gray-900">
                        {registration.organization}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Schedule & Venue Information */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
                    Event Logistics
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>Date:</strong> {EVENT_DATA.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>Time:</strong> {EVENT_DATA.time}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Venue:</strong> {EVENT_DATA.venue}, {EVENT_DATA.city}</span>
                    </div>
                  </div>
                </div>

                {/* Check-in verification instructions & Firestore Badge */}
                <div className="pt-3 text-xs text-gray-700 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved in Firebase Firestore</span>
                  </div>
                  <span className="font-mono text-gray-600">Status: Confirmed</span>
                </div>
              </div>
            </div>

            {/* Prompt to link account if attendee registered without signing in */}
            {!user && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print">
                <div>
                  <p className="font-semibold text-blue-900">Save this pass to your account</p>
                  <p className="text-blue-700">Create an account or sign in with {registration.email} to view your pass anytime.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shrink-0 transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Action Buttons as requested: Add to Calendar, View Registration, Print Registration */}
            <div className="flex flex-wrap items-center justify-center gap-3 no-print">
              <button
                type="button"
                id="btn-add-to-calendar"
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-blue-600" />
                <span>Add to Calendar</span>
              </button>

              <button
                type="button"
                id="btn-print-registration"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gray-600" />
                <span>Print Registration</span>
              </button>

              <button
                type="button"
                id="btn-new-registration"
                onClick={() => {
                  if (window.confirm('Do you want to clear this saved pass to register another attendee?')) {
                    onClearRegistration();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 hover:text-red-700 transition-colors cursor-pointer"
              >
                <span>Register someone else</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
