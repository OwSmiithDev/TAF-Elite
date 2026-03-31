import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/services/supabase/client';

// Screens
import { SplashScreen } from '@/screens/SplashScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { MainTabs } from '@/navigation/MainTabs';
import { AdminDashboard } from '@/screens/admin/AdminDashboard';
import { AdminExercisesScreen } from '@/screens/admin/AdminExercisesScreen';

export function AppNavigator() {
  const { session, isLoading, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Mock auth flow for UI preview
      setTimeout(() => {
        setLoading(false);
      }, 1500);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          useAuthStore.getState().setProfile(profile);
        }
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          useAuthStore.getState().setProfile(profile);
        }
      } else {
        useAuthStore.getState().setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {!session ? (
          <>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          /* Protected Routes */
          <>
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/exercises" element={<AdminExercisesScreen />} />
            {/* Add more admin routes here later */}
            <Route path="/*" element={<MainTabs />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
