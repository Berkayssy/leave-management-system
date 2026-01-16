interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: number; // +%10 gibi
}

export default function StatsCard({ title, value, icon, color, trend }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-amber-500 to-yellow-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600',
    indigo: 'from-indigo-500 to-blue-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className={`h-2 bg-gradient-to-r ${colorClasses[color]}`}></div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-xl  bg-opacity-10`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}