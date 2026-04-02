import { authHandler } from "@/auth"

export default async function Navbar() {
  const session = await authHandler()

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{session?.user?.nama}</p>
          <p className="text-xs text-gray-400 capitalize">{session?.user?.role?.toLowerCase()}</p>
        </div>
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">
          👤
        </div>
      </div>
    </header>
  )
}