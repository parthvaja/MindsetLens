import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export default function Card({ children, padding = true, className = '', ...props }: CardProps) {
  return (
    <div
      className={['bg-white rounded-xl shadow-sm border border-gray-100', padding ? 'p-6' : '', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
