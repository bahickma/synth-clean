import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, ...props }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-4" {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
