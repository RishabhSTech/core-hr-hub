import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceSession } from '@/types/hrms';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AttendanceCalendarProps {
  sessions: AttendanceSession[];
}

export function AttendanceCalendar({ sessions }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusForDay = (day: Date) => {
    const daySession = sessions.find(s => 
      isSameDay(new Date(s.sign_in_time), day)
    );
    return daySession?.status || null;
  };

  const getSessionForDay = (day: Date) => {
    return sessions.find(s => isSameDay(new Date(s.sign_in_time), day));
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-200';
      case 'half_day': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'on_leave': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'late': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-background text-foreground border-border';
    }
  };

  const selectedSession = selectedDay ? getSessionForDay(selectedDay) : null;

  const calculateWorkingHours = (session: AttendanceSession) => {
    if (!session.sign_out_time) return 'In progress';
    const start = new Date(session.sign_in_time);
    const end = new Date(session.sign_out_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hours`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const status = getStatusForDay(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-md text-sm font-medium border transition-colors",
                    getStatusColor(status),
                    isToday(day) && "ring-2 ring-primary ring-offset-2",
                    "hover:opacity-80"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span className="text-xs text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
              <span className="text-xs text-muted-foreground">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              <span className="text-xs text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
              <span className="text-xs text-muted-foreground">On Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          {selectedSession ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sign In</p>
                  <p className="font-medium">{format(new Date(selectedSession.sign_in_time), 'h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sign Out</p>
                  <p className="font-medium">
                    {selectedSession.sign_out_time 
                      ? format(new Date(selectedSession.sign_out_time), 'h:mm a')
                      : 'Not signed out'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="font-medium">{calculateWorkingHours(selectedSession)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedSession.status.replace('_', ' ')}</p>
                </div>
              </div>
              {selectedSession.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No attendance record for this day</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
