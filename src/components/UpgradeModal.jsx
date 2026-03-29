import { motion, AnimatePresence } from 'framer-motion';
import { PLAN_TIERS } from '../modules/plans';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default function UpgradeModal({ open, reason, moduleName, onClose, onSelectPlan }) {
  const plans = Object.values(PLAN_TIERS);

  const title = reason === 'module'
    ? `${moduleName || 'Este módulo'} es Pro`
    : reason === 'projects'
      ? 'Llegaste al límite de proyectos'
      : 'Mejorá tu plan';

  const subtitle = reason === 'module'
    ? 'Actualizá tu plan para desbloquear todas las herramientas profesionales.'
    : reason === 'projects'
      ? 'El plan Free permite hasta 3 proyectos. Pasá a Pro para proyectos ilimitados.'
      : 'Elegí el plan que mejor se adapte a tu trabajo.';

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
            className="upgrade-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="upgrade-header">
              <div className="upgrade-lock-icon">
                <LockIcon />
              </div>
              <h2 className="upgrade-title">{title}</h2>
              <p className="upgrade-subtitle">{subtitle}</p>
              <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Plan cards */}
            <div className="upgrade-plans">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`upgrade-plan-card ${plan.recommended ? 'recommended' : ''} ${plan.id === 'free' ? 'current' : ''}`}
                >
                  {plan.recommended && (
                    <div className="upgrade-recommended">
                      <StarIcon /> Recomendado
                    </div>
                  )}
                  <div className="upgrade-plan-name" style={{ color: plan.id === 'free' ? 'var(--text2)' : undefined }}>
                    {plan.label}
                  </div>
                  <div className="upgrade-plan-tagline">{plan.tagline}</div>
                  <div className="upgrade-plan-price">
                    <span className="upgrade-price-amount">{plan.price}</span>
                    <span className="upgrade-price-detail">{plan.priceDetail}</span>
                  </div>
                  <ul className="upgrade-features">
                    {plan.features.map((f, i) => (
                      <li key={i}>
                        <span className="upgrade-feature-check" style={{ color: plan.recommended ? 'var(--accent)' : 'var(--green)' }}>
                          <CheckIcon />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.id === 'free' ? (
                    <button className="upgrade-plan-btn current" disabled>
                      Plan actual
                    </button>
                  ) : (
                    <button
                      className={`upgrade-plan-btn ${plan.recommended ? 'primary' : 'outline'}`}
                      onClick={() => onSelectPlan(plan.id)}
                    >
                      {plan.recommended ? 'Actualizar a Pro' : 'Contactar ventas'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="upgrade-footer">
              Podés cambiar o cancelar tu plan en cualquier momento.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
