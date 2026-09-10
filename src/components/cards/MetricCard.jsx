import React from 'react';

const MetricCard = ({ icon: Icon, title, value, subtitle, progress }) => {
  return (
    <div className="relative h-full overflow-hidden rounded-[20px] bg-transparent p-5">

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/[0.08] blur-3xl" />

      {/* Top Row */}
      <div className="relative mb-6 flex items-start justify-between">

        {/* Icon */}
        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-2xl
            border border-violet-400/[0.12]
            bg-gradient-to-br from-violet-500/[0.16] to-blue-500/[0.08]
            shadow-[0_8px_25px_rgba(99,102,241,0.08)]
          "
        >
          <Icon className="h-5 w-5 text-violet-300" />
        </div>

        {/* Status */}
        <span
          className="
            rounded-full
            border border-white/[0.06]
            bg-white/[0.035]
            px-3 py-1.5
            text-[10px]
            font-semibold
            text-white/45
          "
        >
          {progress >= 75
            ? '📈 Great'
            : progress >= 50
            ? '👍 Good'
            : '🚀 Keep going'}
        </span>
      </div>

      {/* Title */}
      <h3 className="relative mb-2 text-xs font-medium tracking-wide text-gray-500 dark:text-slate-400">
        {title}
      </h3>

      {/* Main Value */}
      <p className="relative mb-2 text-[30px] font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>

      {/* Subtitle */}
      <p className="relative mb-5 min-h-[18px] truncate text-[11px] text-gray-500 dark:text-white/35">
        {subtitle}
      </p>

      {/* Progress */}
      <div className="relative">

        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
            Progress
          </span>

          <span className="text-[10px] font-semibold text-violet-300/70">
            {progress}%
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">

          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-violet-500
              via-purple-500
              to-blue-400
              shadow-[0_0_12px_rgba(139,92,246,0.35)]
              transition-all
              duration-500
            "
            style={{ width: `${progress}%` }}
          />

        </div>
      </div>

    </div>
  );
};

export default MetricCard;