import { Link, useLocation } from "wouter";
import { LayoutDashboard, Clock, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Panel", icon: LayoutDashboard },
    { href: "/checkin", label: "Terminal", icon: Clock },
    { href: "/employees", label: "Empleados", icon: Users },
    { href: "/attendance", label: "Asistencia", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="font-bold text-lg flex items-center gap-2.5 tracking-tight">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Clock className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span>
              Con<span className="text-primary">Trolz</span>
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest">v1.0.0</p>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
