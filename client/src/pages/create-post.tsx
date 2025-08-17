import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PostCreationForm } from "@/components/shared/post-creation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Hash, Clock } from "lucide-react";

export default function CreatePost() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600">Create engaging content for your social media channels</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Creation Form */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <PostCreationForm />
              </CardContent>
            </Card>
          </div>

          {/* Tips Sidebar */}
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">Add emojis to increase engagement by up to 25%</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Hash className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">Use 3-5 relevant hashtags for optimal reach</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">Best posting times: 9-10 AM and 7-9 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Character Limits</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Twitter:</span>
                  <span className="font-medium">280 characters</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Instagram:</span>
                  <span className="font-medium">2,200 characters</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Facebook:</span>
                  <span className="font-medium">63,206 characters</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">LinkedIn:</span>
                  <span className="font-medium">3,000 characters</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
