import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { EventHeader } from './components/EventHeader.tsx';
import { About } from './components/About.tsx';
import { Highlights } from './components/Highlights.tsx';
import { Agenda } from './components/Agenda.tsx';
import { Speakers } from './components/Speakers.tsx';
import { Venue } from './components/Venue.tsx';
import { FAQ } from './components/FAQ.tsx';
import { RSVP } from './components/RSVP.tsx';
import { Footer } from './components/Footer.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { fetchUserRsvp, unRsvpFromFirestore } from './services/rsvpService.ts';
import { Registration } from './data/eventData.ts';
import { CheckCircle2 } from 'lucide-react';

const getUserRsvpKey = (uid: string) => `gdg_user_rsvp_${uid}`;

function AppContent() {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  const { user, openAuthModal } = useAuth();

  // Ensure registrations are tied to the authenticated user's session only.
  // When a user logs out, their registration is immediately cleared so no registration is visible.
  useEffect(() => {
    // Purge any legacy global keys to prevent registration leaks across accounts
    try {
      localStorage.removeItem('gdg_fiem_bwai_registration_v1');
      localStorage.removeItem('gdg_build_with_ai_registration_2026');
      localStorage.removeItem('gdg_fiem_cloud_rsvps_cache');
    } catch {
      // ignore
    }

    if (!user) {
      // User is logged out: immediately clear registration state and close modal
      setRegistration(null);
      setIsPassModalOpen(false);
      return;
    }

    // User is logged in: read user-scoped cache for instant responsive UI
    const userKey = getUserRsvpKey(user.uid);
    try {
      const cached = localStorage.getItem(userKey);
      if (cached) {
        setRegistration(JSON.parse(cached));
      } else {
        setRegistration(null);
      }
    } catch (err) {
      console.error('Error reading user registration cache:', err);
      setRegistration(null);
    }

    let isCurrent = true;
    async function syncFirestoreRsvp() {
      if (!user) return;
      try {
        const cloudRsvp = await fetchUserRsvp(user.uid, user.email);
        if (!isCurrent) return;
        if (cloudRsvp) {
          setRegistration(cloudRsvp);
          try {
            localStorage.setItem(userKey, JSON.stringify(cloudRsvp));
          } catch {
            // ignore
          }
        } else {
          // If no cloud record exists for this user, ensure registration is null
          setRegistration(null);
          try {
            localStorage.removeItem(userKey);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Could not sync RSVP from Firestore:', err);
      }
    }

    syncFirestoreRsvp();

    return () => {
      isCurrent = false;
    };
  }, [user]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRegisterSuccess = (newReg: Registration) => {
    if (!user) return;
    setRegistration(newReg);
    try {
      localStorage.setItem(getUserRsvpKey(user.uid), JSON.stringify(newReg));
    } catch (err) {
      console.error('Error saving registration to localStorage:', err);
    }
  };

  const handleClearRegistration = () => {
    setRegistration(null);
    if (user) {
      try {
        localStorage.removeItem(getUserRsvpKey(user.uid));
      } catch (err) {
        console.error('Error removing registration from localStorage:', err);
      }
    }
    showToast('Previous pass cleared. You can now register a new attendee.');
  };

  const handleUnRsvp = async (regId: string) => {
    try {
      await unRsvpFromFirestore(regId, user?.uid || null);
      setRegistration(null);
      if (user) {
        try {
          localStorage.removeItem(getUserRsvpKey(user.uid));
        } catch (err) {
          console.error('Error removing registration from localStorage:', err);
        }
      }
      setIsPassModalOpen(false);
      showToast('Your RSVP has been cancelled and deleted from the attendee list.');
    } catch (err) {
      console.error('Error during Un-RSVP:', err);
      showToast('Error cancelling RSVP. Please try again.');
      throw err;
    }
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRsvpNavClick = () => {
    handleScrollToSection('rsvp');
    if (!user) {
      openAuthModal('signin');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent('Build With AI - GDG on Campus FIEM');
    const details = encodeURIComponent(
      'Join us for Build With AI organized by GDG on Campus FIEM.\nVenue: Future Institute of Engineering and Management, Sonarpur, Kolkata.\nTagline: Learn. Build. Connect.'
    );
    const location = encodeURIComponent(
      'Future Institute of Engineering and Management (FIEM), Sonarpur, Kolkata, West Bengal'
    );
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261010T043000Z/20261010T113000Z&details=${details}&location=${location}`;

    // Generate .ics file for offline/Apple Calendar
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

    window.open(gCalUrl, '_blank', 'noopener,noreferrer');
    showToast('Calendar invite opened!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#202124]">
      {/* Sticky Header Navbar */}
      <Navbar
        onRsvpClick={handleRsvpNavClick}
        hasRegistration={!!(user && registration)}
        onViewPass={() => setIsPassModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="grow">
        {/* Event Hero / Header */}
        <EventHeader
          onRsvpClick={handleRsvpNavClick}
          hasRegistration={!!(user && registration)}
          onViewPass={() => setIsPassModalOpen(true)}
        />

        {/* About the Event & Who Can Attend */}
        <About />

        {/* What to Expect (Learn, Build, Connect) */}
        <Highlights />

        {/* Single-track Vertical Timeline Agenda */}
        <Agenda />

        {/* Speakers */}
        <Speakers />

        {/* Venue / Location Details */}
        <Venue />

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* Primary RSVP Form & Pass Confirmation */}
        <RSVP
          registration={user ? registration : null}
          onRegisterSuccess={handleRegisterSuccess}
          onClearRegistration={handleClearRegistration}
          onUnRsvp={handleUnRsvp}
          showToast={showToast}
        />
      </main>

      {/* Footer */}
      <Footer
        onNavClick={handleScrollToSection}
      />

      {/* Quick View Registration Modal */}
      <RegistrationModal
        isOpen={isPassModalOpen && !!(user && registration)}
        onClose={() => setIsPassModalOpen(false)}
        registration={user ? registration : null}
        onPrint={handlePrint}
        onAddToCalendar={handleAddToCalendar}
        onUnRsvp={handleUnRsvp}
        showToast={showToast}
      />

      {/* Firebase Sign In / Sign Up Modal */}
      <AuthModal onSuccess={showToast} />

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-5 duration-200 no-print"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

