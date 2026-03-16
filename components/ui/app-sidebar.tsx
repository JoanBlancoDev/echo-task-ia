"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export type SideBarItem = {
  label: string
  href: string
  icon?: React.ReactNode
}

interface AppSideBarProps {
  items: SideBarItem[]
  className?: string
  mobileOnly?: boolean
  side?: "left" | "right"
}

export const AppSideBar: React.FC<AppSideBarProps> = ({ items, className, mobileOnly = false, side = "right" }) => {
  const pathname = usePathname()
  const wrapperVisibilityClass = mobileOnly ? "md:hidden" : undefined

  return (
    <div className={cn(wrapperVisibilityClass, className)}>
      <Sidebar side={side} collapsible="icon">
        <SidebarHeader className="text-3xl font-bold">
          EchoTask AI
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href} className="flex items-center mt-2 text-xl">
                          {item.icon && <span className="text-lg">{item.icon}</span>}
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="text-xs text-muted-foreground">
          <p className="px-2">EchoTask AI</p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  )
}
