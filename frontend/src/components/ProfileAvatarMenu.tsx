import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';

export default function ProfileAvatarMenu() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground">{profile?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground font-normal truncate">{profile?.email || ''}</span>
            {profile?.university && (
              <span className="text-xs text-muted-foreground font-normal">{profile.university}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
