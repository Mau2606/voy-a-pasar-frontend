import React from 'react';

export default function Tooltip({ text, children, position = 'bottom' }) {
  let positionClasses = '';
  let arrowClasses = '';

  switch (position) {
    case 'top':
      positionClasses = 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      arrowClasses = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
      break;
    case 'bottom':
      positionClasses = 'top-full mt-2 left-1/2 -translate-x-1/2';
      arrowClasses = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
      break;
    case 'left':
      positionClasses = 'right-full mr-2 top-1/2 -translate-y-1/2';
      arrowClasses = 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2';
      break;
    case 'right':
      positionClasses = 'left-full ml-2 top-1/2 -translate-y-1/2';
      arrowClasses = 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2';
      break;
    default:
      positionClasses = 'top-full mt-2 left-1/2 -translate-x-1/2';
      arrowClasses = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
      break;
  }

  // If text is not provided, simply render children
  if (!text) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-flex items-center justify-center group pointer-events-auto">
      {children}
      <div 
        className={`absolute ${positionClasses} z-50 flex-col items-center hidden group-hover:flex w-max max-w-[250px] animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none`}
      >
        <div className="relative px-3 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg shadow-xl shadow-black/30 ring-1 ring-white/10 text-center leading-relaxed">
          {text}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 border-gray-900 ${arrowClasses}`} 
          />
        </div>
      </div>
    </div>
  );
}
