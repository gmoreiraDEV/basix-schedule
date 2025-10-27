"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { Calendar, Users, Briefcase, Settings, LogOut, Clock } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavHeaderProps {
  userName: string
}

export function NavHeader({ userName }: NavHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-accent" />
              <h1 className="text-xl font-bold text-foreground">Basix Schedule</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <Calendar className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/bookings">
                  <Clock className="h-4 w-4 mr-2" />
                  Agendamentos
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/services">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Serviços
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/professionals">
                  <Users className="h-4 w-4 mr-2" />
                  Profissionais
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:inline">{userName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
