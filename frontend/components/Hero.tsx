export default function Hero() {
  return (
    <section style={styles.container}>
      <h1 style={styles.title}>Sistema de Gestión De Inventario de Vertex</h1>

      <p style={styles.text}>
        Plataforma institucional para la administración segura de trabajadores,
        activos fijos tangibles y documentación oficial de la empresa.
      </p>

      <p style={styles.subtext}>
        El acceso a la información está restringido únicamente a personal
        autorizado.
      </p>
    </section>
  );
}

const styles = {
  container: {
    padding: '100px 20px',
    textAlign: 'center' as const,
    backgroundColor: '#F1F5F9',
    minHeight: 'calc(100vh - 64px)',
  },
  title: {
    fontSize: '38px',
    color: '#0F172A',
    marginBottom: '24px',
  },
  text: {
    fontSize: '18px',
    color: '#334155',
    maxWidth: '720px',
    margin: '0 auto 20px',
  },
  subtext: {
    fontSize: '15px',
    color: '#64748B',
  },
};
