import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, ShoppingCart, Package } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pedidos", href: "/orders", icon: ShoppingCart },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const router = useRouter();

  return (
    <div className="relative z-20 m-4 flex flex-col rounded-[2rem] border bg-white/85 shadow-[var(--xp-shadow)] backdrop-blur md:h-[calc(100vh-2rem)] md:w-72">
      <div className="flex min-h-24 flex-col justify-center border-b px-6 md:min-h-28">
        <div className="xp-chip mb-3 w-fit">Marketplaces</div>
        <h1 className="font-heading text-4xl font-black leading-none text-foreground">
          Painel <em className="text-[var(--xp-peach-d)]">soft</em>
        </h1>
      </div>
      <nav className="grid grid-cols-2 gap-3 p-4 md:flex md:flex-1 md:flex-col md:space-y-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                isActive
                  ? "bg-[var(--xp-peach)] text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-[var(--xp-mint)] hover:text-foreground"
              )}
            >
              <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-white",
                isActive && "bg-white/70"
              )}>
                <Icon className="h-5 w-5" />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
