import { Link, useLocation } from "wouter";
import { LayoutDashboard, Clock, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/checkin", label: "Check-in Kiosk", icon: Clock },
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/attendance", label: "Attendance Logs", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen flex w-full bg-muted/40">
      <aside className="w-64 flex-shrink-0 bg-card border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="font-semibold text-lg flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Clock className="h-4 w-4" />
            </div>
            AttendanceIQ
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
