import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/auth";
import { FileText, Clock, Heart, Users } from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalPosts: number;
  scheduled: number;
  engagement: number;
  followers: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/recent"],
    queryFn: async () => {
      const response = await fetch("/api/posts/recent?limit=5", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch recent posts");
      return response.json();
    },
  });

  const { data: socialProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["/api/social-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/social-profiles", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch social profiles");
      return response.json();
    },
  });

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatEngagement = (engagement: number) => {
    return `${engagement.toFixed(1)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your social media management activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Posts"
            value={stats?.totalPosts || 0}
            change="+12%"
            icon={FileText}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
          <StatsCard
            title="Scheduled"
            value={stats?.scheduled || 0}
            change="+5"
            icon={Clock}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
          />
          <StatsCard
            title="Engagement"
            value={formatEngagement(stats?.engagement || 0)}
            change="+2.1%"
            icon={Heart}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatsCard
            title="Followers"
            value={stats?.followers || "0"}
            change="+156"
            icon={Users}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts?.length > 0 ? (
                    recentPosts.map((post: any) => (
                      <div key={post.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60"
                            alt="Post thumbnail"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {post.content.substring(0, 120)}...
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <i className={`fab fa-${post.platforms[0]} mr-1 ${
                                post.platforms[0] === 'instagram' ? 'text-pink-500' : 
                                post.platforms[0] === 'facebook' ? 'text-blue-600' : 
                                post.platforms[0] === 'linkedin' ? 'text-blue-700' : 
                                'text-gray-500'
                              }`}></i>
                              {post.platforms[0].charAt(0).toUpperCase() + post.platforms[0].slice(1)}
                            </span>
                            <span>
                              {post.status === "published" 
                                ? new Date(post.publishedAt).toLocaleString()
                                : post.scheduledAt 
                                ? new Date(post.scheduledAt).toLocaleString()
                                : "Draft"
                              }
                            </span>
                            <span className={`flex items-center ${
                              post.status === "published" ? "text-green-600" : 
                              post.status === "scheduled" ? "text-amber-600" : 
                              "text-gray-600"
                            }`}>
                              <i className={`fas ${
                                post.status === "published" ? "fa-check-circle" : 
                                post.status === "scheduled" ? "fa-clock" : 
                                "fa-edit"
                              } mr-1`}></i>
                              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No posts yet</p>
                      <Link href="/create-post">
                        <Button className="mt-2">Create your first post</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle>Connected Accounts</CardTitle>
                <Link href="/social-accounts">
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profilesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {socialProfiles?.length > 0 ? (
                    socialProfiles.map((profile: any) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            profile.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            profile.platform === 'facebook' ? 'bg-blue-600' :
                            profile.platform === 'linkedin' ? 'bg-blue-700' :
                            profile.platform === 'twitter' ? 'bg-black' :
                            'bg-gray-500'
                          }`}>
                            <i className={`fab fa-${profile.platform === 'twitter' ? 'x-twitter' : profile.platform} text-white`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{profile.username}</p>
                            <p className="text-xs text-gray-500">
                              {profile.followers?.toLocaleString() || 0} followers
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.isConnected 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          <i className={`fas fa-circle mr-1 text-${
                            profile.isConnected ? "green" : "amber"
                          }-400`} style={{ fontSize: "6px" }}></i>
                          {profile.isConnected ? "Connected" : "Pending"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No accounts connected</p>
                      <Link href="/social-accounts">
                        <Button className="mt-2">Connect your first account</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
