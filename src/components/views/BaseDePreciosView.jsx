import { motion } from 'framer-motion';

export default function BaseDePreciosView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="dash-greeting">Base de Precios</div>
      <div className="dash-sub">Referencia de precios unitarios para presupuestación de obra.</div>
      <div className="placeholder-view">
        <div className="placeholder-icon">🏷️</div>
        <div className="placeholder-title">Base de Precios</div>
        <div className="placeholder-sub">Esta sección está en construcción.</div>
      </div>
    </motion.div>
  );
}
