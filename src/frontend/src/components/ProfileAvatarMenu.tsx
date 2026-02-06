import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { clearAuthIntent } from '@/utils/authIntent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import type { UserProfile } from '@/backend';

interface ProfileAvatarMenuProps {
  userProfile: UserProfile | null | undefined;
  isLoading?: boolean;
}

export default function ProfileAvatarMenu({ userProfile, isLoading }: ProfileAvatarMenuProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    clearAuthIntent();
    queryClient.clear();
    navigate({ to: '/' });
  };

  // Get initials from name for fallback
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center rounded-full transition-marketplace hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-9 w-9 border-2 border-border">
            <AvatarImage
              src="/assets/generated/profile-icon-transparent.dim_32x32.png"
              alt={userProfile?.name || 'Profile'}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {isLoading ? '...' : getInitials(userProfile?.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {isLoading ? (
              <>
                <p className="text-sm font-medium leading-none text-muted-foreground">Loading...</p>
                <p className="text-xs leading-none text-muted-foreground">Please wait</p>
              </>
            ) : userProfile ? (
              <>
                <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{userProfile.email}</p>
                {userProfile.university && (
                  <p className="text-xs leading-none text-muted-foreground mt-1">{userProfile.university}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground">Profile loading...</p>
              </>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
