import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { Calendar, Clock, Upload, Send } from "lucide-react";

const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  scheduledAt: z.string().optional(),
});

type CreatePostData = z.infer<typeof createPostSchema>;

const platformOptions = [
  { id: "instagram", name: "Instagram", icon: "fab fa-instagram", color: "text-pink-500" },
  { id: "facebook", name: "Facebook", icon: "fab fa-facebook", color: "text-blue-600" },
  { id: "twitter", name: "Twitter", icon: "fab fa-x-twitter", color: "text-black" },
  { id: "linkedin", name: "LinkedIn", icon: "fab fa-linkedin", color: "text-blue-700" },
];

interface PostCreationFormProps {
  onSuccess?: () => void;
}

export function PostCreationForm({ onSuccess }: PostCreationFormProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      platforms: [],
      scheduledAt: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const postData = {
        content: data.content,
        platforms: data.platforms,
        status: data.scheduledAt ? "scheduled" : "published",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        mediaUrls: [],
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: showSchedule ? "Post scheduled successfully!" : "Post published successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePostData) => {
    createPostMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?"
                  rows={6}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drag and drop your images or videos here</p>
            <button type="button" className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Or click to browse
            </button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="platforms"
          render={() => (
            <FormItem>
              <FormLabel>Select Platforms</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platformOptions.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control}
                    name="platforms"
                    render={({ field }) => {
                      return (
                        <FormItem key={platform.id} className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <label className={`flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              field.value?.includes(platform.id) 
                                ? "border-indigo-500 bg-indigo-50" 
                                : ""
                            }`}>
                              <Checkbox
                                checked={field.value?.includes(platform.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, platform.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== platform.id
                                        )
                                      )
                                }}
                                className="sr-only"
                              />
                              <div className="flex items-center space-x-2">
                                <i className={`${platform.icon} ${platform.color}`}></i>
                                <span className="text-sm font-medium">{platform.name}</span>
                              </div>
                              {field.value?.includes(platform.id) && (
                                <i className="fas fa-check ml-auto text-indigo-600"></i>
                              )}
                            </label>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {showSchedule && (
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Date & Time</FormLabel>
                <FormControl>
                  <input
                    type="datetime-local"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center space-x-4">
          <Button 
            type="submit" 
            disabled={createPostMutation.isPending}
            className={`flex-1 ${!showSchedule ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
          >
            {createPostMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {showSchedule ? "Schedule Post" : "Post Now"}
          </Button>
          <Button
            type="button"
            variant={showSchedule ? "default" : "outline"}
            className="flex-1"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            <Clock className="mr-2 h-4 w-4" />
            {showSchedule ? "Cancel Schedule" : "Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
