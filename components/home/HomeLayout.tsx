import React from 'react'
import { AppSideBar, SideBarItem } from '../ui/app-sidebar'
interface Props {
  children: React.ReactNode
}

const sidebarItems: SideBarItem[] = [
  { label: 'Login', href: '/dashboard' },
  { label: 'Projects', href: '/projects' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Settings', href: '/settings' },
]

export const HomeLayout = ({ children }: Props) => {
  return (
    <AppSideBar items={sidebarItems}>
      {children}
    </AppSideBar>
  )
}
