import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/atoms/Icon';
import { Button } from '@/components/atoms/Button';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  period: string;
  income: number;
  expenses: number;
}

interface EnhancedChartProps {
  type: 'pie' | 'line' | 'bar';
  data: ChartData[] | TimeSeriesData[];
  title: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  animated?: boolean;
  showLegend?: boolean;
  className?: string;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-enhanced p-3 border shadow-lg">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value?.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EnhancedChart: React.FC<EnhancedChartProps> = ({
  type,
  data,
  title,
  subtitle,
  height = 300,
  loading = false,
  animated = true,
  showLegend = true,
  className
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (animated) {
      setAnimationKey(prev => prev + 1);
    }
  }, [data, animated]);

  if (loading) {
    return (
      <div className={cn("card-enhanced p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          {subtitle && <div className="h-4 bg-gray-200 rounded w-48"></div>}
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'pie':
        const pieData = data as ChartData[];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart key={animationKey}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={animated ? 1000 : 0}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        const lineData = data as TimeSeriesData[];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart key={animationKey} data={lineData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Income"
                animationDuration={animated ? 1500 : 0}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Expenses"
                animationDuration={animated ? 1500 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        const barData = data as ChartData[];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart key={animationKey} data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                animationDuration={animated ? 1000 : 0}
              >
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'pie': return PieChartIcon;
      case 'line': return TrendingUp;
      case 'bar': return BarChart3;
      default: return TrendingUp;
    }
  };

  return (
    <div className={cn("card-enhanced p-6 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100">
          <Icon icon={getIcon()} size="sm" />
        </Button>
      </div>

      {/* Chart */}
      <div className="chart-container-enhanced">
        {renderChart()}
      </div>

      {/* Legend for pie chart */}
      {type === 'pie' && showLegend && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {(data as ChartData[]).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {item.name}
              </span>
              <span className="text-xs font-medium ml-auto">
                ₹{item.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
