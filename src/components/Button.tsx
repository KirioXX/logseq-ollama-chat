import React from 'react';

export const Button =({
  children,
  onClick
}: {
  children: string,
  onClick: () => void
}) => {
  return <button
    type="button"
    className="py-2.5 px-5 me-2 mb-2 text-sm font-medium focus:outline-none rounded-full border focus:z-10 focus:ring-4 focus:ring-gray-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
    onClick={onClick}
  >
      {children}
    </button>;
}
