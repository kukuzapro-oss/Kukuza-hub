import React from 'react';
import {
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types/index.ts';

export interface OrderProgressTrackerProps {
  order: Order;
  variant?: 'card' | 'compact' | 'modal';
  onReorder?: (serviceId: string) => void;
  onViewDetails?: (order: Order) => void;
}

interface StepDefinition {
  id: string;
  key: 'pending' | 'processing' | 'in_progress' | 'completed';
  title: string;
  swahili: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StepDefinition[] = [
  {
    id: 'stage_1',
    key: 'pending',
    title: 'Pending',
    swahili: 'Imepokelewa',
    description: 'Oda imepokewa na malipo yamethibitishwa.',
    icon: Clock,
  },
  {
    id: 'stage_2',
    key: 'processing',
    title: 'Processing',
    swahili: 'Inachakatwa',
    description: 'Mfumo unaandaa na kukagua link ya akaunti.',
    icon: Layers,
  },
  {
    id: 'stage_3',
    key: 'in_progress',
    title: 'In Progress',
    swahili: 'Inatekelezwa',
    description: 'Huduma inawasilishwa moja kwa moja kwenye mtandao.',
    icon: Activity,
  },
  {
    id: 'stage_4',
    key: 'completed',
    title: 'Completed',
    swahili: 'Imekamilika',
    description: 'Idadi yote imekamilishwa kikamilifu.',
    icon: CheckCircle2,
  },
];

export function getOrderStageIndex(order: Order): number {
  if (order.status === 'completed') return 3; // Stage 4 (0-indexed: 3)
  if (order.status === 'in_progress') return 2; // Stage 3 (0-indexed: 2)
  if (order.status === 'processing') return 1; // Stage 2 (0-indexed: 1)
  if (order.status === 'pending') {
    // If provider order id is present, system is already processing
    return order.provider_order_id ? 1 : 0;
  }
  if (order.status === 'partial') return 2;
  return 0;
}

export function getDeliveryProgressPercentage(order: Order): number {
  if (order.status === 'completed') return 100;
  if (order.status === 'canceled') return 0;

  const total = order.quantity || 1;
  const remains = typeof order.remains === 'number' ? order.remains : total;
  const delivered = Math.max(0, total - remains);

  if (order.status === 'in_progress') {
    // Base 50% for reaching In Progress, plus portion of delivered quantity up to 95%
    const deliveryRatio = delivered / total;
    return Math.max(50, Math.min(95, Math.round(50 + deliveryRatio * 45)));
  }

  if (order.status === 'processing') return 40;
  if (order.status === 'pending') {
    return order.provider_order_id ? 30 : 15;
  }

  return 0;
}

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({
  order,
  variant = 'card',
  onReorder,
  onViewDetails,
}) => {
  const isCanceled = order.status === 'canceled';
  const currentStageIndex = getOrderStageIndex(order);
  const progressPercent = getDeliveryProgressPercentage(order);

  // Remaining and Delivered calculations
  const total = order.quantity || 0;
  const remains = typeof order.remains === 'number' ? order.remains : total;
  const delivered = Math.max(0, total - remains);

  // Compact variant: for table row cells
  if (variant === 'compact') {
    if (isCanceled) {
      return (
        <div className="flex flex-col gap-1 min-w-[130px]">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Imesitishwa (Canceled)</span>
          </div>
          <div className="w-full bg-rose-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-full rounded-full"></div>
          </div>
        </div>
      );
    }

    const currentStage = STAGES[currentStageIndex];

    return (
      <div className="flex flex-col gap-1 min-w-[150px]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            {currentStage.key === 'in_progress' && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            )}
            {currentStage.key === 'processing' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            )}
            {currentStage.key === 'completed' && (
              <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
            )}
            {currentStage.title}
          </span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">
            {progressPercent}%
          </span>
        </div>

        {/* 4-Segment Progress Bar */}
        <div className="grid grid-cols-4 gap-1 w-full">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === 'completed';
            const isCurrent = idx === currentStageIndex && order.status !== 'completed';
            return (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-sky-500 animate-pulse'
                    : 'bg-slate-200'
                }`}
                title={`${s.title} (${s.swahili})`}
              />
            );
          })}
        </div>

        <div className="text-[10px] text-slate-400 truncate">
          {currentStage.swahili} • Hatua {currentStageIndex + 1}/4
        </div>
      </div>
    );
  }

  // Modal variant: detailed breakdown for order details popup
  if (variant === 'modal') {
    if (isCanceled) {
      return (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Oda Hii Imesitishwa (Canceled)</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            Oda hii ilisitishwa na mfumo au mtoa huduma. Kiasi cha TZS {order.charge_tzs.toLocaleString()} kimerudishwa kwenye salio lako la Kukuza Pro.
          </p>
        </div>
      );
    }

    return (
      <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Maendeleo ya Oda (Progress Tracker)
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              {progressPercent}%
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Hatua ya {currentStageIndex + 1} kati ya 4
          </span>
        </div>

        {/* Multi-step Visual Tracker Line */}
        <div className="relative">
          {/* Background track line */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block" />

          {/* Active filled line */}
          <div
            className="absolute top-5 left-6 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 hidden sm:block"
            style={{
              width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
              maxWidth: 'calc(100% - 48px)',
            }}
          />

          {/* Stepper nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {STAGES.map((step, idx) => {
              const isPast = idx < currentStageIndex || order.status === 'completed';
              const isCurrent = idx === currentStageIndex && order.status !== 'completed';
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-white shadow-xs border border-sky-200 scale-102'
                      : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition-all shadow-xs ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <h5 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {step.title}
                  </h5>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {step.swahili}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug hidden sm:block">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/80 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Iliyoagizwa</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {total.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Iliyowasilishwa</span>
            <span className="text-sm font-extrabold text-emerald-700 font-mono">
              {delivered.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Iliyobaki</span>
            <span className="text-sm font-extrabold text-slate-700 font-mono">
              {remains.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Card variant: full featured banner card for Active Orders section at top of MyOrdersView
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all hover:border-slate-300 relative overflow-hidden">
      {/* Decorative subtle accent bar on left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          order.status === 'completed'
            ? 'bg-emerald-500'
            : isCanceled
            ? 'bg-rose-500'
            : order.status === 'in_progress'
            ? 'bg-sky-500'
            : 'bg-amber-500'
        }`}
      />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pl-1.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              ID: {order.id.replace('ord_', '')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date(order.created_at).toLocaleDateString('sw-TZ', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            {order.service_name}
          </h3>
          <a
            href={order.link.startsWith('http') ? order.link : `https://${order.link}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 mt-0.5 max-w-md truncate"
          >
            <span>{order.link}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Right side stats badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
          <div className="text-xs text-slate-500">
            Jumla:{' '}
            <span className="font-mono font-extrabold text-slate-900">
              {order.quantity.toLocaleString()}
            </span>
          </div>
          <div className="text-sm font-extrabold text-emerald-700 font-mono">
            TZS {order.charge_tzs.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Interactive 4-Stage Stepper */}
      <div className="pt-2 pb-4 pl-1.5">
        <div className="relative">
          {/* Desktop background connector line */}
          <div className="absolute top-5 left-7 right-7 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block" />

          {/* Desktop active progress line */}
          <div
            className="absolute top-5 left-7 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-700 hidden sm:block"
            style={{
              width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
              maxWidth: 'calc(100% - 56px)',
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex || order.status === 'completed';
              const isCurrent = idx === currentStageIndex && order.status !== 'completed';
              const StepIcon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`flex items-start sm:flex-col sm:items-center text-left sm:text-center p-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-sky-50/80 border border-sky-200/90'
                      : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mr-2.5 sm:mr-0 sm:mb-2 transition-all shadow-xs ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                      {stage.title}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 block">
                      {stage.swahili}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight hidden lg:block">
                      {stage.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer: Detailed Metrics & Actions */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pl-1.5">
        <div className="flex items-center gap-4 text-slate-600 w-full sm:w-auto">
          <div>
            <span className="text-slate-400 text-[11px]">Iliyowasilishwa: </span>
            <span className="font-mono font-extrabold text-emerald-700">
              {delivered.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Iliyobaki: </span>
            <span className="font-mono font-bold text-slate-700">
              {remains.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Maendeleo: </span>
            <span className="font-mono font-bold text-slate-900">{progressPercent}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Tazama Maelezo
            </button>
          )}

          {onReorder && (
            <button
              onClick={() => onReorder(order.service_id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Agiza Tena</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
