import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';

const steps = [
  {
    id: 'target_exam',
    title: 'Qual seu concurso alvo?',
    options: ['Polícia Militar', 'Polícia Civil', 'Polícia Federal', 'PRF', 'Bombeiros', 'Guarda Municipal', 'Forças Armadas', 'Outro'],
  },
  {
    id: 'current_level',
    title: 'Como você avalia seu nível atual?',
    options: ['Sedentário', 'Iniciante', 'Intermediário', 'Avançado'],
  },
  {
    id: 'pullups_max',
    title: 'Quantas barras fixas você faz hoje?',
    options: ['Nenhuma', '1 a 3', '4 a 8', 'Mais de 8'],
  },
  {
    id: 'running_level',
    title: 'Como está sua corrida?',
    options: ['Não consigo correr 1km', 'Corro 2km com dificuldade', 'Corro 2.4km em 12 min', 'Corro muito bem'],
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
        // Update profile
        await supabase
          .from('profiles')
          .update({
            target_exam: answers.target_exam,
            current_level: answers.current_level,
          } as any)
          .eq('id', user.id);

        // Insert onboarding answers
        await supabase.from('onboarding_answers').insert({
          user_id: user.id,
          running_level: answers.running_level,
          // Map string answers to numbers if needed, keeping simple for now
        } as any);
      }
      
      // Navigate to home after a short delay to show success state
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const step = steps[currentStep];
  const hasAnsweredCurrent = !!answers[step.id];

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0A] text-zinc-100 font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Perfil Criado</h2>
          <p className="text-zinc-400 text-center max-w-xs text-sm font-mono">
            Preparando seu plano de treinamento personalizado...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-zinc-100 px-6 pt-12 pb-8 max-w-md mx-auto shadow-2xl relative font-sans">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              idx <= currentStep ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center mb-8 h-8">
        {currentStep > 0 && (
          <button onClick={handleBack} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronLeft className="w-6 h-6" />
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
            className="h-full flex flex-col"
          >
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8 leading-tight">
              {step.title}
            </h1>

            <div className="space-y-3">
              {step.options.map((option) => {
                const isSelected = answers[step.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full p-5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between font-mono text-sm ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-widest">{option}</span>
                    {isSelected && <Check className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-8">
        <button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          className="flex items-center justify-center w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
        >
          {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
