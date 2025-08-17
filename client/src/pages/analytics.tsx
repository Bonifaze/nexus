import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/auth";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  const { data: socialProfiles } = useQuery({
    queryKey: ["/api/social-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/social-profiles", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch social profiles");
      return response.json();
    },
  });

  // Calculate platform performance
  const getPlatformStats = () => {
    if (!analytics || !socialProfiles) return [];

    const platforms = ["instagram", "facebook", "linkedin", "twitter"];
    
    return platforms.map(platform => {
      const platformAnalytics = analytics.filter((a: any) => a.platform === platform);
      const profile = socialProfiles.find((p: any) => p.platform === platform);
      
      const totalEngagement = platformAnalytics.reduce((sum: number, a: any) => 
        sum + a.likes + a.comments + a.shares, 0
      );
      
      const averageEngagementRate = platformAnalytics.length > 0
        ? platformAnalytics.reduce((sum: number, a: any) => sum + a.engagementRate, 0) / platformAnalytics.length / 100
        : 0;

      return {
        platform,
        posts: platformAnalytics.length,
        engagementRate: averageEngagementRate,
        totalEngagement,
        connected: profile?.isConnected || 0,
      };
    }).filter(p => p.connected);
  };

  // Mock weekly engagement data for the chart
  const weeklyEngagement = [
    { day: "Mon", engagement: 320 },
    { day: "Tue", engagement: 240 },
    { day: "Wed", engagement: 400 },
    { day: "Thu", engagement: 280 },
    { day: "Fri", engagement: 360 },
    { day: "Sat", engagement: 200 },
    { day: "Sun", engagement: 160 },
  ];

  const maxEngagement = Math.max(...weeklyEngagement.map(d => d.engagement));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-xl h-80"></div>
            <div className="bg-gray-200 rounded-xl h-80"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const platformStats = getPlatformStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your social media performance and engagement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Chart */}
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-end justify-between space-x-2">
                {weeklyEngagement.map((data) => {
                  const height = (data.engagement / maxEngagement) * 200; // Max height of 200px
                  
                  return (
                    <div key={data.day} className="flex flex-col items-center space-y-2 flex-1">
                      <div className="relative w-full max-w-12">
                        <div
                          className="bg-indigo-500 rounded-t transition-all duration-300 hover:bg-indigo-600"
                          style={{ height: `${height}px`, minHeight: "4px" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{data.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Weekly engagement across all platforms</p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {platformStats.length > 0 ? (
                  platformStats.map((platform) => {
                    const platformInfo = {
                      instagram: { 
                        name: "Instagram", 
                        icon: "fab fa-instagram",
                        bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
                        iconColor: "text-white"
                      },
                      facebook: { 
                        name: "Facebook", 
                        icon: "fab fa-facebook",
                        bgColor: "bg-blue-600",
                        iconColor: "text-white"
                      },
                      linkedin: { 
                        name: "LinkedIn", 
                        icon: "fab fa-linkedin",
                        bgColor: "bg-blue-700", 
                        iconColor: "text-white"
                      },
                      twitter: { 
                        name: "Twitter", 
                        icon: "fab fa-x-twitter",
                        bgColor: "bg-black",
                        iconColor: "text-white"
                      },
                    };

                    const info = platformInfo[platform.platform as keyof typeof platformInfo];
                    if (!info) return null;

                    return (
                      <div key={platform.platform} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 ${info.bgColor} rounded-lg flex items-center justify-center`}>
                            <i className={`${info.icon} ${info.iconColor} text-sm`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{info.name}</p>
                            <p className="text-xs text-gray-500">{platform.posts} posts this month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {platform.engagementRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-green-600">
                            +{(Math.random() * 5).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No analytics data available</p>
                    <p className="text-sm text-gray-400 mt-1">Connect social accounts and publish posts to see analytics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        {analytics && analytics.length > 0 && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Recent Post Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        item.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        item.platform === 'facebook' ? 'bg-blue-600' :
                        item.platform === 'linkedin' ? 'bg-blue-700' :
                        'bg-gray-500'
                      }`}>
                        <i className={`fab fa-${item.platform === 'twitter' ? 'x-twitter' : item.platform} text-white`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{item.platform}</p>
                        <p className="text-xs text-gray-500">{new Date(item.recordedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{item.likes}</p>
                        <p className="text-xs">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{item.comments}</p>
                        <p className="text-xs">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{item.shares}</p>
                        <p className="text-xs">Shares</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-indigo-600">{(item.engagementRate / 100).toFixed(1)}%</p>
                        <p className="text-xs">Engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
