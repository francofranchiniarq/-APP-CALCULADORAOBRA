import { useRef, useEffect } from 'react';
import { BUDGET_HTML } from '../modules/budgetHtml';

export default function BudgetView({ onBack }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(BUDGET_HTML);
      doc.close();
    }
  }, []);

  return (
    <div>
      <button className="calc-back" onClick={onBack}>← Volver</button>
      <iframe ref={iframeRef} className="budget-frame" title="Presupuesto" />
    </div>
  );
}
