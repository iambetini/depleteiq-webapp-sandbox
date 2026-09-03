"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
import {
  getPermissionsForPath,
  routePermissions,
} from "@/lib/route-permissions"
import type { Permission } from "@/types/permission"

interface PermissionContextValue {
  userPermissions: Permission[]
  loading: boolean
  hasPermission: (permission: string) => boolean
  hasRoutePermission: (routePath: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

const PermissionContext = createContext<PermissionContextValue>({
  userPermissions: [],
  loading: true,
  hasPermission: () => false,
  hasRoutePermission: () => false,
  hasAnyPermission: () => false,
})

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const names = useMemo(
    () => userPermissions.map((p) => (typeof p === "string" ? p : p.name)),
    [userPermissions],
  )

  const isAllAccess = useMemo(() => names.includes("all access"), [names])

  // Fetch permissions from /auth/me (not stored in JWT to keep cookies small)
  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchPermissions() {
      try {
        const { data } = await apiClient.get<{ item: any }>("/auth/me")
        if (cancelled) return
        setUserPermissions(data?.item?.role?.permissions ?? [])
      } catch {
        if (!cancelled) setUserPermissions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPermissions()
    return () => { cancelled = true }
  }, [session?.user])

  // Determine if current route is allowed
  const isRouteAllowed = useMemo(() => {
    if (loading) return false
    if (!session?.user) return false
    if (pathname === "/dashboard/no-permissions") return true
    if (pathname === "/dashboard/change-password") return true
    if (names.length === 0) return false
    if (isAllAccess) return true

    const requiredPermissions = getPermissionsForPath(pathname)
    if (requiredPermissions.length === 0 && pathname !== "/dashboard") return false
    return requiredPermissions.some((p) => names.includes(p))
  }, [loading, session?.user, pathname, names, isAllAccess])

  // Route permission guard — redirect when not allowed
  useEffect(() => {
    if (loading || !session?.user || pathname === "/dashboard/no-permissions") return
    if (!isRouteAllowed) {
      router.replace("/dashboard/no-permissions")
    }
  }, [isRouteAllowed, loading, session?.user, pathname, router])

  const hasPermission = useCallback(
    (permission: string) => isAllAccess || names.includes(permission),
    [names, isAllAccess],
  )

  const hasRoutePermission = useCallback(
    (routePath: string) => {
      if (isAllAccess) return true
      const route = routePermissions.find((r) => r.href === routePath)
      if (!route) return false
      return route.permissions.some((p) => names.includes(p))
    },
    [names, isAllAccess],
  )

  const hasAnyPermission = useCallback(
    (permissions: string[]) => {
      if (permissions.length === 0) return true
      return isAllAccess || permissions.some((p) => names.includes(p))
    },
    [names, isAllAccess],
  )

  const value = useMemo(
    () => ({ userPermissions, loading, hasPermission, hasRoutePermission, hasAnyPermission }),
    [userPermissions, loading, hasPermission, hasRoutePermission, hasAnyPermission],
  )

  return (
    <PermissionContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        </div>
      ) : children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionContext)
}
