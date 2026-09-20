import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Layers,
  Copy,
  Check,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  testFirestoreConnection,
  syncLocalRsvpsToFirestore,
  fetchAllRsvps,
  unRsvpFromFirestore,
  FirestoreRsvpRecord,
} from '../services/rsvpService.ts';

interface AdminRsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminRsvpModal: React.FC<AdminRsvpModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
    code?: string;
    details?: string;
  } | null>(null);

  const [cloudRsvps, setCloudRsvps] = useState<FirestoreRsvpRecord[]>([]);
  const [localRsvps, setLocalRsvps] = useState<FirestoreRsvpRecord[]>([]);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setCloudError(null);
    try {
      const data = await fetchAllRsvps();
      setCloudRsvps(data.cloudRecords);
      setLocalRsvps(data.localRecords);
      setCloudError(data.cloudError);
    } catch (err: any) {
      setCloudError(err?.message || 'Error fetching records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await testFirestoreConnection();
      setConnectionResult(result);
      if (result.success) {
        await loadData();
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncLocalRsvpsToFirestore();
      setSyncResult(
        `Synced ${res.syncedCount} of ${res.totalLocal} RSVPs to Cloud Firestore!${
          res.lastError ? ` (Note: ${res.lastError})` : ''
        }`
      );
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  const recommendedRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(recommendedRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Firebase Firestore RSVP & Sync Inspector
              </h3>
              <p className="text-xs text-gray-500">
                Project: <span className="font-mono font-semibold text-gray-700">sarthak-62d28</span> • Collection: <span className="font-mono text-blue-600 font-semibold">rsvps</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Live Firestore Connection Status Card */}
          <div
            className={`p-4 rounded-xl border ${
              connectionResult?.success
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {connectionResult?.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {testingConnection
                      ? 'Testing Live Firestore Connection...'
                      : connectionResult?.success
                      ? 'Connected to Cloud Firestore'
                      : 'Firestore Live Connection Notice'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed">
                    {connectionResult?.message ||
                      'Checking if collection "rsvps" can be written to in project sarthak-62d28...'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>Test Write</span>
              </button>
            </div>

            {/* If connection failed, show exact fix checklist */}
            {connectionResult && !connectionResult.success && (
              <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2 text-xs">
                <div className="font-semibold text-amber-950 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Why you might not see the data in the Firebase Console:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-amber-900 pl-1">
                  <li>
                    <strong>Firestore Database may not be created yet:</strong> In Firebase Console, go to{' '}
                    <strong>Build &gt; Firestore Database</strong> and click the <strong>&quot;Create database&quot;</strong> button if you see it.
                  </li>
                  <li>
                    <strong>Rules in Production Mode:</strong> By default, Firebase locks rules to{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">allow read, write: if false;</code>.
                  </li>
                  <li>
                    <strong>Looking in Realtime Database:</strong> Make sure you are in{' '}
                    <strong>Firestore Database</strong> (not Realtime Database).
                  </li>
                </ol>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://console.firebase.google.com/project/sarthak-62d28/firestore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <span>Open Firestore Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={copyRules}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRules ? 'Copied Rules' : 'Copy Permissive Rules'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sync Local RSVPs Button */}
          {localRsvps.length > 0 && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
              <div>
                <span className="font-bold block">
                  {localRsvps.length} RSVP{localRsvps.length > 1 ? 's' : ''} stored in local cache
                </span>
                <span className="text-blue-700 text-[11px]">
                  You can push all attendee records directly into Cloud Firestore once rules are active.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncing}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-60"
              >
                <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync to Cloud'}</span>
              </button>
            </div>
          )}

          {syncResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncResult}</span>
            </div>
          )}

          {/* Cloud Records Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Live Cloud Firestore RSVPs ({cloudRsvps.length})
              </h4>
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {cloudError ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 italic">
                Could not read live collection: {cloudError}. Ensure Firestore Database is created and rules allow reading.
              </div>
            ) : cloudRsvps.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                No RSVP documents in Cloud Firestore yet. Submit the registration form or click &quot;Sync to Cloud&quot; above.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {cloudRsvps.map((rsvp) => (
                  <div key={rsvp.registrationId} className="p-3 text-xs flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <span className="font-semibold text-gray-900 block">{rsvp.fullName}</span>
                      <span className="text-[11px] text-gray-500">{rsvp.email} • {rsvp.organization}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-blue-600 block">{rsvp.registrationId}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                          <CheckCircle2 className="w-2.5 h-2.5" /> In Cloud
                        </span>
                      </div>
                      <button
                        type="button"
                        title="Delete RSVP / Un-RSVP from Firestore"
                        onClick={async () => {
                          if (window.confirm(`Delete RSVP ${rsvp.registrationId} (${rsvp.fullName}) from Firestore?`)) {
                            await unRsvpFromFirestore(rsvp.registrationId, rsvp.userId);
                            await loadData();
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Direct Link to Firebase */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Direct link to collection:</span>
            <a
              href="https://console.firebase.google.com/project/sarthak-62d28/firestore/data/~2Frsvps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 underline"
            >
              <span>console.firebase.google.com/.../rsvps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
