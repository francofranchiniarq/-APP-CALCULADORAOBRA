// ═══════════════════════════════════════════════════════════════
// GanttChart.jsx — Raíz del módulo Gantt
//
// Uso:
//   <GanttChart obraName="Edificio Centro" />
//   <GanttChart initialTasks={tasks} onSave={saveFn} obraName={name} onBack={fn} />
// ═══════════════════════════════════════════════════════════════

import { useRef, useCallback } from 'react';
import { useGanttLogic }    from '../hooks/useGanttLogic.js';
import GanttToolbar         from './GanttToolbar.jsx';
import GanttTaskList        from './GanttTaskList.jsx';
import GanttTimeline        from './GanttTimeline.jsx';
import GanttTaskSheet       from './GanttTaskSheet.jsx';
import '../gantt.css';

export function GanttChart({ initialTasks, onSave, obraName, onBack }) {
  const gantt = useGanttLogic({ initialTasks, onSave });

  // ── Refs para sync de scroll vertical ────────────────────────
  const leftScrollRef  = useRef(null);
  const rightScrollRef = useRef(null);
  const syncingRef     = useRef(false);

  const handleLeftScroll = useCallback((e) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = e.target.scrollTop;
    syncingRef.current = false;
  }, []);

  const handleRightScroll = useCallback((e) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (leftScrollRef.current) leftScrollRef.current.scrollTop = e.target.scrollTop;
    syncingRef.current = false;
  }, []);

  return (
    <div className="gantt-root">
      {/* ── Toolbar ── */}
      <GanttToolbar
        obraName={obraName}
        onBack={onBack}
        zoom={gantt.zoom}
        setZoom={gantt.setZoom}
        filterGremio={gantt.filterGremio}
        setFilterGremio={gantt.setFilterGremio}
        allGremios={gantt.allGremios}
        showCritical={gantt.showCritical}
        setShowCritical={gantt.setShowCritical}
        collapsedGroups={gantt.collapsedGroups}
        groupOrder={gantt.groupOrder}
        collapseAll={gantt.collapseAll}
        expandAll={gantt.expandAll}
        onAutoSchedule={gantt.runAutoSchedule}
        onAddTask={() => gantt.addTask()}
        onSave={onSave ? gantt.handleSave : null}
        tasks={gantt.tasks}
      />

      {/* ── Body: lista + timeline ── */}
      <div className="gantt-body">
        {/* Panel izquierdo */}
        <GanttTaskList
          visibleRows={gantt.visibleRows}
          selectedId={gantt.selectedId}
          onSelectTask={gantt.selectTask}
          onToggleGroup={gantt.toggleGroup}
          scrollRef={leftScrollRef}
          onScroll={handleLeftScroll}
        />

        {/* Divisor arrastrable */}
        <div className="gantt-divider" />

        {/* Panel derecho */}
        <GanttTimeline
          visibleRows={gantt.visibleRows}
          columns={gantt.columns}
          timelineBounds={gantt.timelineBounds}
          selectedId={gantt.selectedId}
          showCritical={gantt.showCritical}
          taskMap={gantt.taskMap}
          onSelectTask={gantt.selectTask}
          onUpdateTask={gantt.updateTask}
          scrollRef={rightScrollRef}
          onScroll={handleRightScroll}
        />
      </div>

      {/* ── Drawer de edición ── */}
      <GanttTaskSheet
        task={gantt.selectedTask}
        open={gantt.sheetOpen}
        onClose={gantt.closeSheet}
        onUpdate={gantt.updateTask}
        onDelete={gantt.deleteTask}
        allTasks={gantt.tasks}
      />
    </div>
  );
}

export default GanttChart;
