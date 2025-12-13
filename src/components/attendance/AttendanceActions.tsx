import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock } from 'lucide-react';
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

  const handleSignIn = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('attendance_sessions')
        .insert({
          user_id: user.id,
          sign_in_time: new Date().toISOString(),
          status: 'present'
        });

      if (error) throw error;
      toast.success('Signed in successfully');
      onSessionUpdate();
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
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
      } else if (signInTime.getHours() > 9) {
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
      toast.success('Signed out successfully');
      onSessionUpdate();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = () => {
    if (!currentSession) return '0h 0m';
    const start = new Date(currentSession.sign_in_time);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSession ? (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="p-2 rounded-full bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Currently Working</p>
                <p className="text-xs text-green-600">
                  Started at {format(new Date(currentSession.sign_in_time), 'h:mm a')}
                </p>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-foreground">{calculateWorkingHours()}</p>
              <p className="text-sm text-muted-foreground">Time worked today</p>
            </div>
            <Button 
              className="w-full" 
              variant="destructive" 
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border">
              <div className="p-2 rounded-full bg-muted-foreground/10">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Not Signed In</p>
                <p className="text-xs text-muted-foreground">Click below to start your session</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleSignIn}
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
