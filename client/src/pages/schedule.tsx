import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["/api/posts/scheduled"],
    queryFn: async () => {
      const response = await fetch("/api/posts/scheduled", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch scheduled posts");
      return response.json();
    },
  });

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (days.length < 42) { // 6 weeks
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getPostsForDate = (date: Date) => {
    if (!scheduledPosts) return [];
    
    return scheduledPosts.filter((post: any) => {
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-gray-200 rounded-xl h-96"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Schedule</h1>
          <p className="text-gray-600">Manage your upcoming posts and content calendar</p>
        </div>

        <Card className="border-gray-200">
          {/* Calendar Header */}
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl">{formatMonth(currentDate)}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Week
                </Button>
                <Button size="sm" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Calendar Grid */}
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {/* Days Header */}
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {getDaysInMonth().map((date, index) => {
                const postsForDate = getPostsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-1 border border-gray-100 hover:bg-gray-50 rounded-lg ${
                      !isCurrentMonth(date) ? "opacity-40" : ""
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday 
                        ? "bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        : isCurrentMonth(date) 
                        ? "text-gray-900" 
                        : "text-gray-400"
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {postsForDate.map((post: any) => {
                        const platform = post.platforms[0];
                        const platformColors = {
                          instagram: "bg-pink-100 text-pink-800",
                          facebook: "bg-blue-100 text-blue-800",
                          twitter: "bg-gray-100 text-gray-800",
                          linkedin: "bg-blue-100 text-blue-700",
                        };

                        return (
                          <div
                            key={post.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              platformColors[platform as keyof typeof platformColors] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <i className={`fab fa-${platform === 'twitter' ? 'x-twitter' : platform} mr-1`}></i>
                            {post.content.substring(0, 15)}...
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        {scheduledPosts && scheduledPosts.length > 0 && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledPosts.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        {post.platforms.map((platform: string) => (
                          <i key={platform} className={`fab fa-${platform === 'twitter' ? 'x-twitter' : platform} mr-1 ${
                            platform === 'instagram' ? 'text-pink-500' : 
                            platform === 'facebook' ? 'text-blue-600' : 
                            platform === 'linkedin' ? 'text-blue-700' : 
                            'text-gray-500'
                          }`}></i>
                        ))}
                        {post.platforms.join(", ")}
                      </span>
                      <span>{new Date(post.scheduledAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
