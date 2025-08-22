// src/components/layout/Header.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local state
      logout();
      navigate("/");
    }
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Rui Courier</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {isAuthenticated && (
                <>
                  {user?.role === "CUSTOMER" && (
                    <NavigationMenuItem>
                      <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                        Dashboard
                      </Link>
                    </NavigationMenuItem>
                  )}
                  {user?.role === "ADMIN" && (
                    <NavigationMenuItem>
                      <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                        Admin
                      </Link>
                    </NavigationMenuItem>
                  )}
                  {user?.role === "AGENT" && (
                    <NavigationMenuItem>
                      <Link to="/agent" className="text-sm font-medium transition-colors hover:text-primary">
                        Agent Portal
                      </Link>
                    </NavigationMenuItem>
                  )}
                  <NavigationMenuItem>
                    <Link to="/parcels" className="text-sm font-medium transition-colors hover:text-primary">
                      Parcels
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Search bar could go here */}</div>
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/placeholder.jpg" alt={getUserDisplayName()} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {user?.role === "CUSTOMER" && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-parcels">My Parcels</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
