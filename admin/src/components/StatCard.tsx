import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  primary: { bg: 'bg-[#00B4D8]/10', text: 'text-[#00B4D8]', icon: 'text-[#00B4D8]' },
  accent: { bg: 'bg-[#FF7A00]/10', text: 'text-[#FF7A00]', icon: 'text-[#FF7A00]' },
  'green-500': { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
  'blue-500': { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
  'red-500': { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const colors = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className={`text-3xl font-bold ${colors.text} mb-1`}>{value}</h3>
          {trend && (
            <p className="text-xs text-green-600 font-medium bg-green-50 inline-block px-2 py-1 rounded-lg">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${colors.bg}`}>
          <Icon size={32} className={colors.icon} />
        </div>
      </div>
    </div>
  );
}
