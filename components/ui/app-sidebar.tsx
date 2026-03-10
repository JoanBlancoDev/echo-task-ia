import React from "react";
import { cn } from "@/lib/utils";

export type SideBarItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

interface AppSideBarProps {
  items: SideBarItem[];
  children?: React.ReactNode;
  className?: string;
}

export const AppSideBar: React.FC<AppSideBarProps> = ({ items, children, className }) => {
  return (
    <aside
      className={cn(
        "flex flex-col w-64 min-h-screen bg-zinc-950 text-zinc-100 border-r border-zinc-800 px-4 py-6 gap-4",
        className
      )}
    >
      <nav className="flex-1">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-900 transition-colors"
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {children && <div className="mt-4">{children}</div>}
    </aside>
  );
};
