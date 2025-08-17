import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { 
  BarChart3, 
  Calendar, 
  FolderOpen, 
  Link as LinkIcon, 
  PlusCircle, 
  Share2,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Create Post", href: "/create-post", icon: PlusCircle },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Content Library", href: "/content-library", icon: FolderOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Social Accounts", href: "/social-accounts", icon: LinkIcon },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <Share2 className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-white font-bold text-lg">Project Nexus</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "text-indigo-700 bg-indigo-50" 
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                }`}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40" 
              alt="User avatar" 
              className="h-8 w-8 rounded-full"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
