import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Eliminar', danger = true, onConfirm, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-panel modal-panel-sm"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{title}</h2>
            </div>
            <div className="modal-body">
              <p className="modal-confirm-msg">{message}</p>
              <div className="modal-actions">
                <button type="button" className="modal-btn-secondary" onClick={onClose}>Cancelar</button>
                <button
                  type="button"
                  className={danger ? 'modal-btn-danger' : 'modal-btn-primary'}
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
