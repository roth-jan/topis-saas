'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Fehler aufgetreten</h2>
        <button onClick={() => reset()}>Erneut versuchen</button>
      </body>
    </html>
  );
}
