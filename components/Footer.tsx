export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 border-t" style={{ borderColor: '#1F2633' }}>
      <p className="text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} City Like Journal
      </p>
    </footer>
  );
}

