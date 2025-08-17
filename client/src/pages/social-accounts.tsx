import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";

const connectAccountSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  username: z.string().min(1, "Username is required"),
  followers: z.number().min(0).optional(),
});

type ConnectAccountData = z.infer<typeof connectAccountSchema>;

const platformOptions = [
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: "fab fa-instagram",
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    description: "Visual content platform"
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: "fab fa-facebook",
    bgColor: "bg-blue-600",
    description: "Social networking"
  },
  { 
    id: "twitter", 
    name: "X (Twitter)", 
    icon: "fab fa-x-twitter",
    bgColor: "bg-black",
    description: "Microblogging platform"
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: "fab fa-linkedin",
    bgColor: "bg-blue-700",
    description: "Professional networking"
  },
  { 
    id: "tiktok", 
    name: "TikTok", 
    icon: "fab fa-tiktok",
    bgColor: "bg-black",
    description: "Short-form video content"
  },
];

export default function SocialAccounts() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialProfiles, isLoading } = useQuery({
    queryKey: ["/api/social-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/social-profiles", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch social profiles");
      return response.json();
    },
  });

  const form = useForm<ConnectAccountData>({
    resolver: zodResolver(connectAccountSchema),
    defaultValues: {
      platform: "",
      username: "",
      followers: 0,
    },
  });

  const connectAccountMutation = useMutation({
    mutationFn: async (data: ConnectAccountData) => {
      const response = await fetch("/api/social-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          platform: data.platform,
          username: data.username,
          followers: data.followers || 0,
          isConnected: 1,
          accessToken: "mock-token", // In real app, this would come from OAuth
          refreshToken: "mock-refresh-token",
          tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect account");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social account connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
      setConnectDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectAccountMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const response = await fetch(`/api/social-profiles/${profileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect account");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social account disconnected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConnectAccountData) => {
    connectAccountMutation.mutate(data);
  };

  const getConnectedPlatforms = () => {
    if (!socialProfiles) return [];
    return socialProfiles.map((profile: any) => profile.platform);
  };

  const getAvailablePlatforms = () => {
    const connectedPlatforms = getConnectedPlatforms();
    return platformOptions.filter(platform => !connectedPlatforms.includes(platform.id));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-48"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
            <p className="text-gray-600">Connect and manage your social media accounts</p>
          </div>
          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Connect Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect Social Account</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailablePlatforms().map((platform) => (
                              <SelectItem key={platform.id} value={platform.id}>
                                <div className="flex items-center space-x-2">
                                  <i className={`${platform.icon} text-gray-600`}></i>
                                  <span>{platform.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username/Handle</FormLabel>
                        <FormControl>
                          <Input placeholder="@username or page name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Followers (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Number of followers"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConnectDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={connectAccountMutation.isPending}
                      className="flex-1"
                    >
                      {connectAccountMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : null}
                      Connect
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connected Accounts */}
          {socialProfiles?.map((profile: any) => {
            const platformInfo = platformOptions.find(p => p.id === profile.platform);
            if (!platformInfo) return null;

            return (
              <Card key={profile.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`h-12 w-12 ${platformInfo.bgColor} rounded-xl flex items-center justify-center`}>
                        <i className={`${platformInfo.icon} text-white text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{platformInfo.name}</h3>
                        <p className="text-sm text-gray-500">{platformInfo.description}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.isConnected 
                        ? "bg-green-100 text-green-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {profile.isConnected ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {profile.isConnected ? "Connected" : "Pending"}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-medium">{profile.username}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Followers:</span>
                      <span className="font-medium">{profile.followers?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="font-medium">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => disconnectAccountMutation.mutate(profile.id)}
                      disabled={disconnectAccountMutation.isPending}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Available Platforms to Connect */}
          {getAvailablePlatforms().map((platform) => (
            <Card key={platform.id} className="border-gray-200 hover:shadow-md transition-shadow opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-12 w-12 ${platform.bgColor} opacity-50 rounded-xl flex items-center justify-center`}>
                      <i className={`${platform.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Not Connected
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 text-gray-400">
                  <div className="flex justify-between text-sm">
                    <span>Account:</span>
                    <span>--</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Followers:</span>
                    <span>--</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Sync:</span>
                    <span>--</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    form.setValue("platform", platform.id);
                    setConnectDialogOpen(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Connect {platform.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Need Help Connecting Accounts?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Authentication Process</h4>
                <p className="text-sm text-gray-600">
                  When you connect an account, you'll be redirected to the platform's authentication page. 
                  Grant the necessary permissions to allow Project Nexus to post on your behalf.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Permissions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Post content to your timeline/feed</li>
                  <li>• Read basic account information</li>
                  <li>• Access follower count and engagement metrics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
