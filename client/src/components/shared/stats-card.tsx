import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconBgColor, 
  iconColor 
}: StatsCardProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`h-12 w-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor} h-6 w-6`} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-600 font-medium">{change}</span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
