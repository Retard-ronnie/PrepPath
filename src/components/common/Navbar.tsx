"use client"

import Link from 'next/link'
import { useState } from "react"
import { Menu, User, LogOut, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useAuth } from '@/hooks/useAuth' 

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { SignoutUser } from '@/actions/FirebaseUserApi'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const { user, userData, loading } = useAuth()
  const USER_NAME = userData?.name || userData?.displayName || ((userData?.firstName || '') +' '+ (userData?.lastName || '')) || 'User'

  // console.log('Console Log from Chrome:', useAuth)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm px-4">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand - Left Side */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">PrepPath</span>
          </Link>
        </div>

        {/* Desktop Navigation - Right Side */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          <NavigationMenu>
            <NavigationMenuList>              <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/interview" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Interviews
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/learning" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Learning
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem><NavigationMenuItem>
                {/* <Link href="/resources" legacyBehavior passHref> */}
                <NavigationMenuLink
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={navigationMenuTriggerStyle()}
                >                    {theme === 'dark' ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
                </NavigationMenuLink>
                {/* </Link> */}
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Menu or Auth Buttons */}
          {user && !loading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage
                      src={userData?.photo || userData?.photoURL}
                      alt={userData?.name || userData?.displayName || userData?.firstName || 'User'}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {USER_NAME.split(' ').reduce((prev, curr)=> curr[0] + prev, '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.name || userData?.displayName || userData?.firstName || (userData?.firstName && userData?.lastName ? userData.firstName + userData.lastName : null) || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href='/profile' className='flex gap-2 w-full'>
                  <DropdownMenuItem className='w-full cursor-pointer'>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href='/edit-profile' className='flex gap-2 w-full'>
                  <DropdownMenuItem className='w-full cursor-pointer'>
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  SignoutUser()
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>            <div className="flex flex-col space-y-4 py-4">              <Link
              href="/dashboard"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
              <Link
                href="/interview"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Interviews
              </Link>
              <Link
                href="/learning"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Learning
              </Link>
              <button
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setIsOpen(false);
                }}
              >                {theme === 'dark' ? (
                <div className="flex items-center">
                  <Sun className="mr-2 h-6 w-6" />
                  Light Mode
                </div>
              ) : (
                <div className="flex items-center">
                  <Moon className="mr-2 h-6 w-6" />
                  Dark Mode
                </div>
              )}
              </button>
              {user ? (
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 rounded-md bg-accent/50 p-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userData?.photo || userData?.photoURL} alt={userData?.name || userData?.displayName || userData?.firstName || (userData?.firstName && userData?.lastName ? userData.firstName + userData.lastName : null) || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {'Mr/Ms'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{userData?.name || userData?.displayName || userData?.firstName || (userData?.firstName && userData?.lastName ? userData.firstName + userData.lastName : null) || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{userData?.email || user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/edit-profile"
                      className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                    <button
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm text-left hover:bg-accent"
                      onClick={async () => {
                        SignoutUser()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 flex flex-col space-y-2">
                  <Link
                    href="/auth/login"
                    className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium border border-input hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
