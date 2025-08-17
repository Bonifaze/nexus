import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import { Upload, Grid3X3, List, Eye, Download, Trash2 } from "lucide-react";

export default function ContentLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contentItems, isLoading } = useQuery({
    queryKey: ["/api/content-library"],
    queryFn: async () => {
      const response = await fetch("/api/content-library", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch content library");
      return response.json();
    },
  });

  // Mock content data for demo since we don't have real uploads yet
  const mockContent = [
    {
      id: "1",
      fileName: "office-building.jpg",
      fileUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3",
      fileType: "image",
      fileSize: 2048000,
      tags: ["office", "building", "corporate"],
      createdAt: new Date(),
    },
    {
      id: "2", 
      fileName: "team-meeting.jpg",
      fileUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3",
      fileType: "image",
      fileSize: 1536000,
      tags: ["team", "meeting", "collaboration"],
      createdAt: new Date(),
    },
    {
      id: "3",
      fileName: "smartphone-apps.jpg", 
      fileUrl: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?ixlib=rb-4.0.3",
      fileType: "image",
      fileSize: 1024000,
      tags: ["smartphone", "apps", "social media"],
      createdAt: new Date(),
    },
  ];

  const displayContent = contentItems?.length > 0 ? contentItems : mockContent;

  const filteredContent = displayContent.filter((item: any) => {
    const matchesFilter = filter === "all" || item.fileType === filter;
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600">Organize and manage your content assets</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search content..."
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-500 mb-4">Upload your first image or video to get started</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredContent.map((item: any) => (
                  <div
                    key={item.id}
                    className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={item.fileUrl}
                      alt={item.fileName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContent.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.fileUrl}
                        alt={item.fileName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.fileName}</h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(item.fileSize)} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
