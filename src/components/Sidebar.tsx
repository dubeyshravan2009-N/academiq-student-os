// Reusable horizontal tab navigation used inside dashboards.
// Pass an array of {id, label, icon, badge?} and the active tab + setter.

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Sidebar({ tabs, activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-ink-100 p-1 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === t.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {t.icon} {t.label}
          {t.badge ? <span className="badge bg-error-50 text-error-700 ml-1">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
