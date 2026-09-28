import React from 'react';
import { CalendarClock, Utensils, CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3
  onStepClick: (step: number) => void;
  maxAccessibleStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxAccessibleStep,
}) => {
  const steps = [
    { number: 1, label: 'Thời Gian & Bàn', icon: CalendarClock, desc: 'Ngày, giờ & chỗ ngồi' },
    { number: 2, label: 'Chọn Món Trước', icon: Utensils, desc: 'Thực đơn & đồ uống' },
    { number: 3, label: 'Xác Nhận & Email', icon: CheckCircle2, desc: 'Thông tin & nhận vé' },
  ];

  return (
    <div className="w-full bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isClickable = step.number <= maxAccessibleStep;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.number)}
                className={`flex items-center gap-3.5 text-left transition-all ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                    isActive
                      ? 'bg-amber-600 text-stone-950 ring-4 ring-amber-100 scale-105'
                      : isCompleted
                      ? 'bg-stone-900 text-amber-400'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-amber-400" /> : <Icon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                      Bước 0{step.number}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                        Đã xong
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm sm:text-base font-bold ${isActive ? 'text-stone-900' : 'text-stone-700'}`}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-stone-500 hidden md:block">{step.desc}</p>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-[2px] bg-stone-200 mx-2 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-300"
                    style={{
                      width: currentStep > step.number ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
