import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import type { Database } from '@/types/database';

type Contest = Database['public']['Tables']['contests']['Row'];

const steps = [
  {
    id: 'target_exam',
    title: 'Qual seu concurso alvo?',
    options: [] as string[],
  },
  {
    id: 'current_level',
    title: 'Como voce avalia seu nivel atual?',
    options: ['Sedentario', 'Iniciante', 'Intermediario', 'Avancado'],
  },
  {
    id: 'pullups_max',
    title: 'Quantas barras fixas voce faz hoje?',
    options: ['Nenhuma', '1 a 3', '4 a 8', 'Mais de 8'],
  },
  {
    id: 'running_level',
    title: 'Como esta sua corrida?',
    options: ['Nao consigo correr 1km', 'Corro 2km com dificuldade', 'Corro 2.4km em 12 min', 'Corro muito bem'],
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoadingContests, setIsLoadingContests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setIsLoadingContests(true);

        if (!isSupabaseConfigured) {
          setContests([]);
          return;
        }

        const { data, error } = await supabase.from('contests').select('*').eq('is_active', true).order('name');
        if (error) throw error;

        setContests((data as Contest[]) || []);
      } catch (error) {
        console.error('Error fetching contests for onboarding:', error);
        setContests([]);
      } finally {
        setIsLoadingContests(false);
      }
    };

    fetchContests();
  }, []);

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: option });
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured && user) {
        const selectedContest = contests.find((contest) => contest.id === answers.target_exam) ?? null;

        await supabase
          .from('profiles')
          .update({
            target_exam: selectedContest?.name || null,
            current_level: answers.current_level,
          } as any)
          .eq('id', user.id);

        if (selectedContest) {
          await supabase.from('profile_target_exams').upsert({
            profile_id: user.id,
            contest_id: selectedContest.id,
          });
        }

        await supabase.from('onboarding_answers').insert({
          user_id: user.id,
          running_level: answers.running_level,
        } as any);
      }

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const step = {
    ...steps[currentStep],
    options: currentStep === 0 ? contests.map((contest) => contest.name) : steps[currentStep].options,
  };
  const hasAnsweredCurrent = !!answers[step.id];

  if (isSubmitting) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0A0A0A] font-sans text-zinc-100">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mb-2 text-2xl font-black uppercase tracking-tight">Perfil Criado</h2>
          <p className="max-w-xs text-center text-sm font-mono text-zinc-400">
            Preparando seu plano de treinamento personalizado...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col bg-[#0A0A0A] px-6 pb-8 pt-12 font-sans text-zinc-100 shadow-2xl">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((_, idx) => (
          <div key={idx} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <div className="mb-8 flex h-8 items-center">
        {currentStep > 0 && (
          <button onClick={handleBack} className="-ml-2 p-2 text-zinc-500 transition-colors hover:text-zinc-300">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            <h1 className="mb-8 text-3xl font-black uppercase tracking-tight leading-tight">{step.title}</h1>

            {currentStep === 0 && isLoadingContests ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="space-y-3">
                {step.options.map((option) => {
                  const optionValue =
                    currentStep === 0 ? contests.find((contest) => contest.name === option)?.id || option : option;
                  const isSelected = answers[step.id] === optionValue;

                  return (
                    <button
                      key={optionValue}
                      onClick={() => handleSelect(optionValue)}
                      className={`flex w-full items-center justify-between rounded-xl border p-5 text-left font-mono text-sm transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span className="font-bold uppercase tracking-widest">{option}</span>
                      {isSelected && <Check className="h-5 w-5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-8">
        <button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent || (currentStep === 0 && isLoadingContests)}
          className="flex w-full items-center justify-center rounded-xl bg-emerald-500 py-4 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? 'Finalizar' : 'Proximo'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
