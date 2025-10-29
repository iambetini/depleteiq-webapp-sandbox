"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Logo from "@/images/orbit-logo.png"
import { Bell, Key, LogOut, Search, User } from "lucide-react"
import { useGetNotificationsQuery } from "@/store/notifications"
import { Badge as UiBadge } from "@/components/ui/badge"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

export function DashboardHeader() {
  const { data: session } = useSession()
  const { data: notificationsData } = useGetNotificationsQuery({ params: { per_page: 10 } }) as any
  const notifications = notificationsData?.data?.items || []

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  return (
    <header className="bg-white border-b border-[#eeeeee] px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-0 items-center">
          <Image src={Logo} alt="Orbit Logo" width={100} height={100} priority />
        </div>
        <div className="flex flex-1 justify-center search-bar-shift">
          <div className="relative w-80 flex justify-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#ababab]" />
            <Input placeholder="Search..." className="pl-10 w-full" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-[#ababab]" />
                {/* {Array.isArray(notifications) && notifications.length > 0 && (
                  <UiBadge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-[#ff6600] text-white flex items-center justify-center text-[10px]">
                    {notifications.length}
                  </UiBadge>
                )} */}
              </Button>
            </DropdownMenuTrigger>
            {/* <DropdownMenuContent align="end" className="w-80 p-0">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <DropdownMenuItem key={n.uuid} className="flex flex-col items-start gap-1 py-3">
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-medium">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.created_at}</span>
                      </div>
                      <span className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.body}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">No notifications</div>
                )}
              </div>
            </DropdownMenuContent> */}
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#ff6600] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#444444]">{session?.user?.full_name || "User"}</p>
                  <Badge variant="info" className="text-xs">{session?.user?.role ? session.user.role?.name?.charAt(0).toUpperCase() + session.user.role?.name?.slice(1).toLowerCase()
                    : ""}</Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/security" className="flex items-center cursor-pointer">
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild>
                <Link href="" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
