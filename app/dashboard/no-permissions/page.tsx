"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Mail, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePermissions } from "@/lib/permission-context";

export default function NoPermissionsPage() {
  const { data: session } = useSession();
  const { loading } = usePermissions();

  // Show loading while fetching permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-[#ababab] text-lg font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const handleContactAdmin = () => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@yourcompany.com";
    window.location.href = `mailto:${adminEmail}?subject=Permission Request&body=Hello, I need permissions assigned to my account. My details: ${session?.user?.email}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-[#ff6600] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#ff6600]" />
            </div>
            <CardTitle className="text-xl font-semibold text-[#444444]">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-[#ababab] mb-4">
                Your account doesn&apos;t have the necessary permissions to access this area.
                Please contact your administrator to request the appropriate access.
              </p>
            </div>

            {/* User Information */}
            <div className="bg-[#f8f8f8] rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-[#444444] mb-3">Account Details</h3>

              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#444444] font-medium">
                    {session?.user?.first_name} {session?.user?.last_name}
                  </p>
                  <p className="text-xs text-[#ababab]">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#444444] font-medium">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-[#ababab]">Email Address</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#444444] font-medium">
                    {session?.user?.role?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-[#ababab]">Current Role</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleContactAdmin}
                className="w-full btn-primary"
              >
                Contact Administrator
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-[#ababab]">
                If you believe this is an error, please contact your system administrator
                with the information above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
