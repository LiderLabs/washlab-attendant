export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Mode</h1>
        <p className="text-muted-foreground text-base">
          We’re performing scheduled maintenance. Please check back shortly.
        </p>
      </div>
    </div>
  )
}
