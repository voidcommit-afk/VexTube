'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, LogOut, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function AuthButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        );
    }

    if (session?.user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-green-500/50 transition-all">
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                                {session.user.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-200 truncate">
                            {session.user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {session.user.email}
                        </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                            <User className="w-4 h-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-red-400 focus:text-red-400 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Button asChild variant="outline" size="sm">
            <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign in
            </Link>
        </Button>
    );
}
