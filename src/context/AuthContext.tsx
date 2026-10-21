import React, { createContext, useContext, useState, useEffect } from 'react';
import { isNative, openExternal } from '../native';
import {
  AppUser as User,
  DeviceCode,
  requestDeviceCode,
  pollForSignIn,
  getSavedUser,
  getValidToken,
  signOutDevice,
  hasClientConfig,
} from '../services/deviceAuth';
import { initAuth, googleSignIn, logout as authLogout, getAccessToken } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  deviceCode: DeviceCode | null;
  authError: string | null;
  cancelSignIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deviceCode, setDeviceCode] = useState<DeviceCode | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const cancelled = React.useRef(false);

  useEffect(() => {
    if (!isNative) return;
    const saved = getSavedUser();
    if (saved) {
      getValidToken().then((t) => {
        if (t) {
          setUser(saved);
          setToken(t);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isNative) return;
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const nativeSignIn = async () => {
    setAuthError(null);
    if (!hasClientConfig()) {
      setAuthError('Enter your Google client ID and secret first.');
      return;
    }
    cancelled.current = false;
    try {
      const dc = await requestDeviceCode();
      setDeviceCode(dc);
      openExternal(dc.verificationUrl);
      const u = await pollForSignIn(dc, () => cancelled.current);
      setUser(u);
      setToken(await getValidToken());
    } catch (e) {
      if ((e as Error).message !== 'cancelled') setAuthError((e as Error).message);
    } finally {
      setDeviceCode(null);
    }
  };

  const cancelSignIn = () => {
    cancelled.current = true;
    setDeviceCode(null);
  };

  const signIn = async () => {
    if (isNative) return nativeSignIn();
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isNative) {
      signOutDevice();
      setUser(null);
      setToken(null);
      return;
    }
    setLoading(true);
    try {
      await authLogout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
        getToken: getAccessToken,
        deviceCode,
        authError,
        cancelSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
