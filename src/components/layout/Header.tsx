import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const userEmail = user?.email || 'usuario@clinica.io'
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center md:hidden gap-2">
        <div className="p-1.5 bg-primary text-primary-foreground rounded-md">
          <span className="font-bold text-xs">C.io</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar pacientes ou consultas..."
          className="pl-9 bg-slate-50 border-transparent focus-visible:bg-white transition-colors rounded-full"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-slate-500 hover:bg-slate-100"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || '1'}`}
                  alt="Avatar do Usuário"
                />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Minha Conta</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleSignOut}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
