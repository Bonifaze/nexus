import { Search, Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export function TopBar() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search content, campaigns, or accounts..."
                className="block w-full pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <Button 
              onClick={() => setLocation("/create-post")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
