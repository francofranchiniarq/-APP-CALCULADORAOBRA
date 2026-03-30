import { motion } from 'framer-motion';

export default function PresupuestosView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="dash-greeting">Presupuestos</div>
      <div className="dash-sub">Historial y gestión de presupuestos de obra.</div>
      <div className="placeholder-view">
        <div className="placeholder-icon">📋</div>
        <div className="placeholder-title">Historial de Presupuestos</div>
        <div className="placeholder-sub">Esta sección está en construcción.</div>
      </div>
    </motion.div>
  );
}
