import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Cargando...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingOverlay({ text = 'Procesando...' }: { text?: string }) {
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-950/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}