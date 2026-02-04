import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { AttendanceActions } from '@/components/attendance/AttendanceActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { startOfMonth, endOfMonth, format, isSameDay } from 'date-fns';
import { QueryErrorHandler } from '@/components/QueryErrorHandler';
import { CardSkeleton } from '@/components/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Attendance() {
  const { user } = useAuth();
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  // Fetch attendance sessions
  const {
    data: sessionData,
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions
  } = useAttendance({
    userId: user?.id,
    startDate: monthStart,
    endDate: monthEnd
  });

  // Calculate stats efficiently
  const stats = useMemo(() => {
    const sessions = sessionData?.data || [];
    
    const presentCount = sessions.filter(s => s.status === 'present').length;
    const halfDayCount = sessions.filter(s => s.status === 'half_day').length;
    const lateCount = sessions.filter(s => s.status === 'late').length;
    const absentCount = sessions.filter(s => s.status === 'absent').length;
    
    let totalHours = 0;
    sessions.forEach(s => {
      if (s.sign_out_time) {
        const start = new Date(s.sign_in_time);
        const end = new Date(s.sign_out_time);
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
    });

    return {
      presentDays: presentCount + lateCount,
      absentDays: absentCount,
      halfDays: halfDayCount,
      totalHours: Math.round(totalHours * 10) / 10,
    };
  }, [sessionData?.data]);

  // Find current session
  const currentSession = useMemo(() => {
    return (sessionData?.data || []).find((s) =>
      isSameDay(new Date(s.sign_in_time), now) && !s.sign_out_time
    ) || null;
  }, [sessionData?.data]);

  const handleRefresh = () => {
    refetchSessions();
  };

  const isLoading = sessionsLoading;
  const hasError = sessionsError;

  return (
    <ErrorBoundary>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Track your daily attendance and working hours
            </p>
          </div>

          {/* Error Handler */}
          <QueryErrorHandler 
            error={hasError ? (sessionsError as Error) : null} 
            onRetry={handleRefresh} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <CardSkeleton />
              ) : (
                <AttendanceCalendar sessions={sessionData?.data || []} />
              )}
            </div>
            
            {/* Actions and Stats Section */}
            <div className="space-y-6">
              <AttendanceActions 
                currentSession={currentSession} 
                onSessionUpdate={handleRefresh}
              />
              
              {/* Monthly Summary Card */}
              {isLoading ? (
                <CardSkeleton />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Monthly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Present Days</span>
                        <span className="font-medium text-foreground">{stats.presentDays}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Absent Days</span>
                        <span className="font-medium text-foreground">{stats.absentDays}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Half Days</span>
                        <span className="font-medium text-foreground">{stats.halfDays}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-4">
                        <span className="text-sm text-muted-foreground">Total Hours</span>
                        <span className="font-medium text-foreground">{stats.totalHours}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}
