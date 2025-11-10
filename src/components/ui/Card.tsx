interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div className={`
      gradient-card rounded-xl shadow-lg border border-gray-100
      ${hover ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}