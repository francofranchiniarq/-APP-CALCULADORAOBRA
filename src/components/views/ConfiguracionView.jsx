import { motion } from 'framer-motion';

export default function ConfiguracionView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="dash-greeting">Configuración</div>
      <div className="dash-sub">Ajustes de tu cuenta y preferencias de la aplicación.</div>
      <div className="placeholder-view">
        <div className="placeholder-icon">⚙️</div>
        <div className="placeholder-title">Configuración</div>
        <div className="placeholder-sub">Esta sección está en construcción.</div>
      </div>
    </motion.div>
  );
}
