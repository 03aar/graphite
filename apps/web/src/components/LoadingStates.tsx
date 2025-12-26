export function EditorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function PDFPreviewSkeleton() {
  return (
    <div className="animate-pulse h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
      </div>
    </div>
  );
}

export function CompilationProgress({ progress = 0 }: { progress?: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-24 h-24 mb-4">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            className="text-blue-600 dark:text-blue-400 transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {progress}%
          </span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Compiling LaTeX...</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        This may take a few seconds
      </p>
    </div>
  );
}

export function ButtonLoadingSpinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
