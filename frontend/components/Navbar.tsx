'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Sistema de Gestión</div>

      <div style={styles.actions}>
        <Link href="/login" style={styles.login}>
          Iniciar sesión
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  actions: {
    display: 'flex',
    gap: '16px',
  },
  login: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
