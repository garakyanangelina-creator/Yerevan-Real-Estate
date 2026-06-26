export default function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="font-serif text-lg font-semibold text-primary-900 dark:text-white">{title}</p>
      {message && <p className="mt-2 text-sm text-primary-600 dark:text-white/70">{message}</p>}
    </div>
  );
}
