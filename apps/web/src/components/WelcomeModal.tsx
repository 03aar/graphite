'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Lock, Wifi, Award, ArrowRight } from 'lucide-react';
import { Button } from '@leafit/ui';

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'Welcome to LaTeX Editor!',
      description: 'The fastest, most private way to create beautiful LaTeX documents.',
      features: [
        '✨ No login required - Start instantly',
        '🚀 Lightning-fast compilation',
        '🎨 Professional templates included',
        '💾 Auto-save keeps your work safe',
      ],
    },
    {
      icon: <Lock className="w-12 h-12 text-green-500" />,
      title: 'Privacy First',
      description: 'Your documents never leave your device. Everything stays local.',
      features: [
        '🔒 All data stored in your browser',
        '🚫 No tracking or analytics',
        '💻 Works completely offline',
        '🌍 No servers, no cloud',
      ],
    },
    {
      icon: <Award className="w-12 h-12 text-blue-500" />,
      title: 'Powerful Features',
      description: 'Everything you need for professional LaTeX editing.',
      features: [
        '⌨️ Keyboard shortcuts for power users',
        '📋 Project management built-in',
        '🎯 Command palette (Ctrl/Cmd+K)',
        '🌓 Dark/Light theme support',
      ],
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-lg">
              {currentStep.icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentStep.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            {currentStep.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-2xl">{feature.split(' ')[0]}</span>
                <p className="text-gray-700 dark:text-gray-300 flex-1">
                  {feature.split(' ').slice(1).join(' ')}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? 'w-8 bg-blue-600 dark:bg-blue-400'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleFinish}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  className="px-6"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="px-6 flex items-center gap-2"
              >
                {step < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to show welcome modal on first visit
export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Show after a short delay for better UX
      setTimeout(() => setShowWelcome(true), 500);
    }
  }, []);

  return {
    showWelcome,
    closeWelcome: () => setShowWelcome(false),
  };
}
