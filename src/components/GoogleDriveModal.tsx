import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import {
  findDriveBackupFile,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  DriveFileInfo,
} from '../services/driveService';
import { BackupData } from '../types';
import { isNative, openExternal } from '../native';
import { getClientConfig, saveClientConfig, hasClientConfig } from '../services/deviceAuth';
import {
  Cloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  X,
  LogOut,
  ShieldAlert,
  Database,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  const { user, token, loading: authLoading, signIn, signOut, deviceCode, authError, cancelSignIn } = useAuth();
  const [cid, setCid] = useState(() => (isNative ? getClientConfig().clientId : ''));
  const [csecret, setCsecret] = useState(() => (isNative ? getClientConfig().clientSecret : ''));
  const [showSetup, setShowSetup] = useState(() => isNative && !hasClientConfig());
  const { exportData, importData, expenses } = useExpense();
  const { colors } = useTheme();

  const [isSyncing, setIsSyncing] = useState(false);
  const [driveFile, setDriveFile] = useState<DriveFileInfo | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Destructive Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  // Check Drive file when user logs in or modal opens
  useEffect(() => {
    if (isOpen && user && token) {
      checkDriveStatus();
    }
  }, [isOpen, user, token]);

  const checkDriveStatus = async () => {
    try {
      setIsSyncing(true);
      const file = await findDriveBackupFile();
      setDriveFile(file);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload/Sync local data to Drive
  const handleUploadToDrive = async () => {
    try {
      setIsSyncing(true);
      setStatusMessage({ type: 'info', text: 'Uploading backup to Google Drive...' });
      const backup = exportData();
      const result = await uploadBackupToDrive(backup);
      setDriveFile(result);
      setStatusMessage({
        type: 'success',
        text: `Successfully synced ${backup.expenses.length} expenses to Google Drive!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to sync to Google Drive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Restore data from Drive (DESTRUCTIVE OPERATION: Requires User Confirmation Dialog)
  const handleRestoreFromDrive = async () => {
    if (!driveFile) {
      setStatusMessage({ type: 'error', text: 'No backup found in Google Drive to restore.' });
      return;
    }

    // MANDATORY Confirmation dialog per Workspace guidelines
    setConfirmModal({
      isOpen: true,
      title: 'Restore from Google Drive?',
      description: `This action will replace your current local data (${expenses.length} expenses) with the cloud backup from Google Drive (last modified: ${new Date(
        driveFile.modifiedTime
      ).toLocaleString()}). Are you sure you want to proceed?`,
      onConfirm: async () => {
        try {
          setIsSyncing(true);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setStatusMessage({ type: 'info', text: 'Downloading and applying Google Drive backup...' });

          const backupData = await downloadBackupFromDrive(driveFile.id);
          importData(backupData, 'replace');

          setStatusMessage({
            type: 'success',
            text: `Restored ${backupData.expenses.length} expenses and categories from Google Drive successfully!`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err?.message || 'Failed to restore backup from Google Drive',
          });
        } finally {
          setIsSyncing(false);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="w-full max-w-lg rounded-[32px] p-6 sm:p-7 border shadow-2xl relative animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}30`,
          color: colors.onSurface,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl"
              style={{
                backgroundColor: colors.primaryContainer,
                color: colors.onPrimaryContainer,
              }}
            >
              <Cloud size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Google Drive Cloud Sync</h3>
              <p className="text-xs opacity-65">Seamlessly backup & restore across multiple devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content based on Auth status */}
        {!user ? (
          <div className="space-y-5 text-center py-4">
            <div
              className="p-4 rounded-2xl border text-xs text-left leading-relaxed space-y-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}20`,
              }}
            >
              <div className="font-semibold flex items-center gap-1.5" style={{ color: colors.primary }}>
                <Database size={15} />
                <span>Multi-Device Cloud Synchronization</span>
              </div>
              <p className="opacity-75">
                Sign in with your Google Account to store and sync your expense records securely in your own Google Drive.
                Only this application's specific backup file is accessed.
              </p>
            </div>

            {isNative && (
              <div
                className="p-4 rounded-2xl border text-xs text-left space-y-2"
                style={{ backgroundColor: colors.surface, borderColor: `${colors.outline}20` }}
              >
                <button
                  type="button"
                  onClick={() => setShowSetup(!showSetup)}
                  className="font-semibold w-full text-left"
                  style={{ color: colors.primary }}
                >
                  {showSetup ? '▾' : '▸'} Google setup {hasClientConfig() ? '(done)' : '(required once)'}
                </button>
                {showSetup && (
                  <div className="space-y-2">
                    <input
                      value={cid}
                      onChange={(e) => setCid(e.target.value)}
                      placeholder="Client ID (…apps.googleusercontent.com)"
                      className="w-full px-3 py-2 rounded-xl border bg-transparent outline-none"
                      style={{ borderColor: `${colors.outline}40` }}
                    />
                    <input
                      value={csecret}
                      onChange={(e) => setCsecret(e.target.value)}
                      placeholder="Client secret"
                      className="w-full px-3 py-2 rounded-xl border bg-transparent outline-none"
                      style={{ borderColor: `${colors.outline}40` }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        saveClientConfig(cid, csecret);
                        setShowSetup(false);
                      }}
                      className="px-4 py-2 rounded-full font-semibold"
                      style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {deviceCode && (
              <div
                className="p-4 rounded-2xl border text-center space-y-2"
                style={{ backgroundColor: colors.primaryContainer, color: colors.onPrimaryContainer, borderColor: colors.primary }}
              >
                <div className="text-xs">Enter this code on the Google page that just opened:</div>
                <div className="text-3xl font-black tracking-widest select-text">{deviceCode.userCode}</div>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openExternal(deviceCode.verificationUrl)}
                    className="px-4 py-2 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
                  >
                    Open google.com/device
                  </button>
                  <button
                    type="button"
                    onClick={cancelSignIn}
                    className="px-4 py-2 rounded-full text-xs font-semibold border"
                    style={{ borderColor: colors.primary }}
                  >
                    Cancel
                  </button>
                </div>
                <div className="text-[11px] opacity-70">Waiting for approval…</div>
              </div>
            )}

            {authError && <div className="text-xs text-red-500">{authError}</div>}

            {/* Official Google Material Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={signIn}
                disabled={authLoading || !!deviceCode}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border shadow-sm transition-all hover:shadow-md active:scale-95 text-sm font-medium"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  borderColor: '#e5e7eb',
                }}
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* User Account Card */}
            <div
              className="p-4 rounded-2xl flex items-center justify-between border"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}20`,
              }}
            >
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: colors.primaryContainer,
                      color: colors.onPrimaryContainer,
                    }}
                  >
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold truncate max-w-[200px]" style={{ color: colors.onSurface }}>
                    {user.displayName || 'Google Account'}
                  </div>
                  <div className="text-xs opacity-60 truncate max-w-[200px]">{user.email}</div>
                </div>
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-500/10 text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Cloud File Status */}
            <div
              className="p-4 rounded-2xl border space-y-1.5"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}20`,
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold opacity-70">Google Drive Cloud Status:</span>
                <button
                  onClick={checkDriveStatus}
                  className="flex items-center gap-1 opacity-70 hover:opacity-100 hover:underline"
                  style={{ color: colors.primary }}
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {driveFile ? (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={15} />
                  <span>
                    Backup active (Last modified:{' '}
                    {new Date(driveFile.modifiedTime).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    )
                  </span>
                </div>
              ) : (
                <div className="text-xs opacity-60">
                  No backup found in your Google Drive yet. Tap "Upload / Sync to Drive" below to create one.
                </div>
              )}
            </div>

            {/* Status Message alert */}
            {statusMessage && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : statusMessage.type === 'error'
                    ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                    : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                }`}
              >
                {statusMessage.type === 'error' ? (
                  <AlertCircle size={16} className="flex-shrink-0" />
                ) : (
                  <CheckCircle size={16} className="flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Sync Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleUploadToDrive}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.onPrimary,
                }}
              >
                <Upload size={16} />
                <span>Upload to Drive</span>
              </button>

              <button
                onClick={handleRestoreFromDrive}
                disabled={isSyncing || !driveFile}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold border transition-transform active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: `${colors.outline}40`,
                  color: colors.onSurface,
                }}
              >
                <Download size={16} />
                <span>Restore from Drive</span>
              </button>
            </div>
          </div>
        )}

        {/* Mandatory Destructive Confirmation Modal per Workspace Integration Skill */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div
              className="w-full max-w-md rounded-[28px] p-6 border shadow-2xl relative animate-in zoom-in-95 duration-150"
              style={{
                backgroundColor: colors.surfaceContainer,
                borderColor: `${colors.outline}30`,
                color: colors.onSurface,
              }}
            >
              <div className="flex items-center gap-3 mb-3 text-amber-600 dark:text-amber-400">
                <ShieldAlert size={28} />
                <h4 className="text-lg font-bold">{confirmModal.title}</h4>
              </div>

              <p className="text-xs leading-relaxed opacity-85 mb-5">
                {confirmModal.description}
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-full text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow hover:bg-amber-700 transition-colors"
                >
                  Yes, Restore Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
