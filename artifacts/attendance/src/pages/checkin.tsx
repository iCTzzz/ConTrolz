import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCheckIn, useCheckOut, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AxiosError } from "axios";

export default function Checkin() {
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const handleAction = (type: 'checkin' | 'checkout') => {
    if (!code.trim()) {
      toast.error("Please enter an employee code");
      return;
    }

    const action = type === 'checkin' ? checkIn : checkOut;
    
    action.mutate(
      { data: { employeeCode: code.trim() } },
      {
        onSuccess: (log) => {
          toast.success(`Successfully ${type === 'checkin' ? 'checked in' : 'checked out'}`, {
            description: `${log.employeeName} at ${new Date(log.timestamp).toLocaleTimeString()}`
          });
          setCode("");
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: ['/api/attendance/active'] });
          queryClient.invalidateQueries({ queryKey: ['/api/attendance/recent'] });
        },
        onError: (err: any) => {
          const message = err.response?.data?.message || "An error occurred";
          toast.error(message);
        }
      }
    );
  };

  const isPending = checkIn.isPending || checkOut.isPending;

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md shadow-lg border-muted/50">
          <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Kiosk Terminal</h2>
            <p className="text-muted-foreground text-center mb-8">
              Enter your employee code to record your attendance.
            </p>

            <div className="w-full space-y-6">
              <Input
                type="text"
                placeholder="Employee Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-2xl h-14 tracking-widest uppercase font-mono"
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAction('checkin');
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg"
                  onClick={() => handleAction('checkin')}
                  disabled={isPending}
                >
                  {checkIn.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check In"}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-14 text-lg"
                  onClick={() => handleAction('checkout')}
                  disabled={isPending}
                >
                  {checkOut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check Out"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
