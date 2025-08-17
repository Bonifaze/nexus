import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (scheduledAt: string) => void;
}

export function ScheduleModal({ open, onOpenChange, onSchedule }: ScheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("UTC-5");

  const handleSchedule = () => {
    if (date && time) {
      const scheduledAt = `${date}T${time}`;
      onSchedule(scheduledAt);
      onOpenChange(false);
      setDate("");
      setTime("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!date || !time}
              className="flex-1"
            >
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
