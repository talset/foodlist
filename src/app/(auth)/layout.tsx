export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg2)',
        borderRadius: 12,
        padding: '2rem',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 16px var(--shadow)',
      }}>
        {children}
      </div>
    </div>
  )
}
