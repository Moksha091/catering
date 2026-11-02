export default function Loading() {
  return (
    <div className="container py-24 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading fresh menus and details...
      </p>
    </div>
  );
}

