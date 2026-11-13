import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 bg-white border border-[#E5E2DC] rounded-xl">
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-[#F4F6FA] border border-[#DCE3EE] flex items-center justify-center text-[#355482] mb-4">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#1C1B18]">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B675E] max-w-md mt-1.5 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
