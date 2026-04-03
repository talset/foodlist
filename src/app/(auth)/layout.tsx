export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#fff',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}>
        {children}
      </div>
    </div>
  )
}
