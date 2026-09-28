import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-zinc-800/60">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="page-title">{title}</h1>
        <p className="page-desc">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
