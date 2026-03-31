import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { PlansScreen } from '@/screens/plans/PlansScreen';
import { ExercisesScreen } from '@/screens/exercises/ExercisesScreen';
import { ProgressScreen } from '@/screens/progress/ProgressScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AnimatePresence, motion } from 'framer-motion';

export function MainTabs() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 overflow-hidden max-w-md mx-auto relative shadow-2xl">
      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/plans" element={<PlansScreen />} />
              <Route path="/exercises" element={<ExercisesScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomTabBar />
    </div>
  );
}
