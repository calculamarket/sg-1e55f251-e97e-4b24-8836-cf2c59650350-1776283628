import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Settings, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pedidos", href: "/orders", icon: Package },
    { name: "Configurações", href: "/settings", icon: Settings }
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Marketplaces</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Usuário</p>
            <p className="text-xs text-muted-foreground truncate">usuario@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}