import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Clock, Timer } from 'lucide-react';
import { AttendanceSession } from '@/types/hrms';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceActionsProps {
  currentSession: AttendanceSession | null;
  onSessionUpdate: () => void;
}

export function AttendanceActions({ currentSession, onSessionUpdate }: AttendanceActionsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('0h 0m 0s');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live timer effect for session
  useEffect(() => {
    if (!currentSession) {
      setElapsedTime('0h 0m 0s');
      return;
    }

    const updateTimer = () => {
      const start = new Date(currentSession.sign_in_time);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentSession]);

  const getSessionType = () => {
    if (!currentSession) return null;
    const hour = new Date(currentSession.sign_in_time).getHours();
    if (hour < 12) return { label: 'Morning Session', color: 'bg-amber-100 text-amber-700' };
    if (hour < 17) return { label: 'Afternoon Session', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Evening Session', color: 'bg-purple-100 text-purple-700' };
  };

  const handleSignIn = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          user_id: user.id,
          sign_in_time: new Date().toISOString(),
          status: 'present'
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Session started successfully');
      onSessionUpdate();
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!currentSession) return;
    setLoading(true);

    try {
      const signOutTime = new Date();
      const signInTime = new Date(currentSession.sign_in_time);
      const hoursWorked = (signOutTime.getTime() - signInTime.getTime()) / (1000 * 60 * 60);
      
      let status: 'present' | 'half_day' | 'late' = 'present';
      if (hoursWorked < 4) {
        status = 'half_day';
      } else if (signInTime.getHours() > 10) {
        status = 'late';
      }

      const { error } = await supabase
        .from('attendance_sessions')
        .update({
          sign_out_time: signOutTime.toISOString(),
          status
        })
        .eq('id', currentSession.id);

      if (error) throw error;
      toast.success(`Session ended - ${hoursWorked.toFixed(1)} hours worked`);
      onSessionUpdate();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const sessionType = getSessionType();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Attendance</CardTitle>
          {currentSession && sessionType && (
            <Badge className={sessionType.color}>{sessionType.label}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSession ? (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="p-2 rounded-full bg-green-100 animate-pulse">
                <Timer className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Session Active</p>
                <p className="text-xs text-green-600">
                  Started at {format(new Date(currentSession.sign_in_time), 'h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="text-center py-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Time Elapsed</span>
              </div>
              <p className="text-4xl font-bold text-foreground font-mono tracking-wider">
                {elapsedTime}
              </p>
            </div>

            <Button 
              className="w-full" 
              variant="destructive" 
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loading ? 'Ending Session...' : 'End Session'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border">
              <div className="p-2 rounded-full bg-muted-foreground/10">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No Active Session</p>
                <p className="text-xs text-muted-foreground">Click below to start working</p>
              </div>
            </div>
            
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Current Time</p>
              <p className="text-2xl font-semibold text-foreground">
                {format(currentTime, 'h:mm:ss a')}
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSignIn}
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Starting Session...' : 'Start Session'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
