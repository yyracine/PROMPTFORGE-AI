import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Code2,
  Star,
  ArrowRight,
  Clock,
  BookTemplate,
  History,
  Copy,
  BarChart3,
  TrendingUp,
  Folder,
  Tag as TagIcon,
  Zap,
  Layers,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AppLogo } from '../common/AppLogo';

export const DashboardView: React.FC = () => {
  const {
    stats,
    prompts,
    templates,
    categories,
    resolvedTheme,
    setActiveView,
    startNewPromptDraft,
    openPromptInOptimizer,
    openTemplateInGenerator,
    setSelectedPromptIdForHistory,
    addToast,
  } = useWorkspace();

  const [analyticsBreakdownMode, setAnalyticsBreakdownMode] = useState<'categories' | 'tags'>(
    'categories'
  );

  const favoritePrompts = prompts.filter((p) => p.is_favorite).slice(0, 5);
  const recentPrompts = prompts.slice(0, 6);
  const topTemplates = templates.slice(0, 6);

  const handleCopyPrompt = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    addToast('success', `Prompt « ${title} » copié dans le presse-papiers.`);
  };

  // Theme-adaptive colors for Recharts
  const isDark = resolvedTheme === 'dark';
  const axisTextColor = isDark ? '#9DA5B4' : '#57606A';
  const gridStrokeColor = isDark ? '#21262D' : '#E2E6EC';
  const tooltipBg = isDark ? '#14171C' : '#FFFFFF';
  const tooltipBorder = isDark ? '#2B313B' : '#D0D7DE';
  const primaryColor = isDark ? '#6E56CF' : '#5B5BD6';
  const secondaryColor = isDark ? '#3E9B4F' : '#2E7D32';

  // Category & Tag frequency data (Generations vs Optimizations)
  const categoryChartData = useMemo(() => {
    if (stats?.categoryMetrics && stats.categoryMetrics.length > 0) {
      return stats.categoryMetrics
        .filter((c) => c.totalActivity > 0 || c.promptsCount > 0)
        .slice(0, 7)
        .map((c) => ({
          label: c.name.length > 22 ? `${c.name.slice(0, 20)}…` : c.name,
          fullName: c.name,
          generations: c.generationsCount,
          optimizations: c.optimizationsCount,
          total: c.totalActivity,
        }));
    }

    // Fallback derived directly from prompts + categories
    const catMap = new Map<string, string>();
    categories.forEach((c) => catMap.set(c.id, c.name));
    const counts = new Map<string, { generations: number; optimizations: number }>();
    prompts.forEach((p) => {
      const catName = catMap.get(p.category_id) || 'Développement logiciel';
      const entry = counts.get(catName) || { generations: 0, optimizations: 0 };
      entry.generations += 1;
      entry.optimizations += Math.max(0, (p.usage_count || 1) - 1);
      counts.set(catName, entry);
    });
    return Array.from(counts.entries())
      .map(([name, val]) => ({
        label: name.length > 22 ? `${name.slice(0, 20)}…` : name,
        fullName: name,
        generations: val.generations,
        optimizations: val.optimizations,
        total: val.generations + val.optimizations,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [stats?.categoryMetrics, prompts, categories]);

  const tagChartData = useMemo(() => {
    if (stats?.tagMetrics && stats.tagMetrics.length > 0) {
      return stats.tagMetrics.slice(0, 8).map((t) => ({
        label: `#${t.name}`,
        fullName: `#${t.name}`,
        generations: t.generationsCount,
        optimizations: t.optimizationsCount,
        total: t.totalActivity,
      }));
    }

    const counts = new Map<string, { generations: number; optimizations: number }>();
    prompts.forEach((p) => {
      (p.tags || []).forEach((tag) => {
        const key = tag.trim();
        if (!key) return;
        const entry = counts.get(key) || { generations: 0, optimizations: 0 };
        entry.generations += 1;
        entry.optimizations += Math.max(0, (p.usage_count || 1) - 1);
        counts.set(key, entry);
      });
    });

    return Array.from(counts.entries())
      .map(([name, val]) => ({
        label: `#${name}`,
        fullName: `#${name}`,
        generations: val.generations,
        optimizations: val.optimizations,
        total: val.generations + val.optimizations,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [stats?.tagMetrics, prompts]);

  // 7-day timeline data for AreaChart
  const timelineChartData = useMemo(() => {
    if (stats?.timeline && stats.timeline.length > 0) {
      return stats.timeline;
    }

    const days: {
      dateKey: string;
      dateLabel: string;
      generations: number;
      optimizations: number;
      total: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateKey = d.toISOString().slice(0, 10);
      const dateLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      days.push({ dateKey, dateLabel, generations: 0, optimizations: 0, total: 0 });
    }

    prompts.forEach((p) => {
      const createdKey = (p.created_at || '').slice(0, 10);
      const updatedKey = (p.updated_at || '').slice(0, 10);
      const cDay = days.find((d) => d.dateKey === createdKey);
      if (cDay) {
        cDay.generations += 1;
        cDay.total += 1;
      }
      const uDay = days.find((d) => d.dateKey === updatedKey);
      if (uDay && updatedKey !== createdKey) {
        uDay.optimizations += 1;
        uDay.total += 1;
      }
    });

    return days;
  }, [stats?.timeline, prompts]);

  const activeBarData =
    analyticsBreakdownMode === 'categories' ? categoryChartData : tagChartData;

  const topCategoryName = categoryChartData[0]?.fullName || 'Développement logiciel';
  const topTagName = tagChartData[0]?.fullName || '#Django';

  // Widget de statistiques rapides : Nombre de prompts créés, catégories les plus utilisées et dernier prompt optimisé
  const quickStatsWidget = useMemo(() => {
    const totalCreated = prompts.length;

    // Catégories les plus utilisées triées par nombre de prompts et activité
    const topCategories = categoryChartData.slice(0, 4);

    // Détection du dernier prompt optimisé (task_type === 'optimization' ou version v2+ ou updated_at > created_at)
    const optimizedPrompts = prompts
      .filter(
        (p) =>
          p.task_type === 'optimization' ||
          (p.tags || []).includes('optimise') ||
          (p.version && p.version > 1) ||
          p.updated_at !== p.created_at
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const lastOptimized = optimizedPrompts[0] || null;

    let lastOptimizedFormattedDate = 'Aucune optimisation récente';
    let lastOptimizedRelative = '';
    if (lastOptimized) {
      const d = new Date(lastOptimized.updated_at);
      lastOptimizedFormattedDate = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const diffHours = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) {
        lastOptimizedRelative = 'Il y a moins d’une heure';
      } else if (diffHours < 24) {
        lastOptimizedRelative = `Il y a ${diffHours}h`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        lastOptimizedRelative = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      }
    }

    return {
      totalCreated,
      topCategories,
      lastOptimized,
      lastOptimizedFormattedDate,
      lastOptimizedRelative,
    };
  }, [prompts, categoryChartData]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* En-tête de la page avec le logo de l'application */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="flex items-center gap-4">
          <AppLogo size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
                PromptForge <span className="text-orange-500">IA</span> — Espace de travail
              </h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Concevez, optimisez, évaluez et versionnez vos prompts professionnels dans une base SQLite locale.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveView('software-dev')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-sm font-medium text-[var(--text-main)] transition-colors whitespace-nowrap shrink-0"
          >
            <Code2 className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Développement logiciel</span>
          </button>

          <button
            onClick={() => setActiveView('optimizer')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-sm font-medium text-[var(--text-main)] transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Optimiseur</span>
          </button>

          <button
            onClick={startNewPromptDraft}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-sm font-medium transition-opacity whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Créer un prompt</span>
          </button>
        </div>
      </div>

      {/* WIDGET DE STATISTIQUES RAPIDES (Prompts créés, Catégories principales, Dernier prompt optimisé) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-[var(--bg-surface)] border border-indigo-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400 shrink-0">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <span>Statistiques Rapides du Workspace</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Temps Réel SQLite
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Aperçu instantané de l'activité de création, des dossiers favoris et de la dernière optimisation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('library')}
              className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Voir toute la bibliothèque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Blocs Principaux du Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Bloc 1 : Nombre de prompts créés */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prompts créés</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)] px-2 py-0.5 rounded">
                Base Locale
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-display font-extrabold text-[var(--text-main)] font-mono tabular-nums">
                {quickStatsWidget.totalCreated}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {stats?.totalVersions ?? quickStatsWidget.totalCreated} version(s) et itération(s) au total
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-secondary)]">Favoris :</span>
              <span className="font-bold text-[var(--text-main)] font-mono">
                {stats?.favoritePrompts ?? favoritePrompts.length} prompt(s)
              </span>
            </div>
          </div>

          {/* Bloc 2 : Catégories les plus utilisées */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Catégories les plus utilisées</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)] px-2 py-0.5 rounded">
                Top {quickStatsWidget.topCategories.length}
              </span>
            </div>

            <div className="space-y-1.5 py-1">
              {quickStatsWidget.topCategories.length > 0 ? (
                quickStatsWidget.topCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-main)] truncate max-w-[170px]" title={cat.fullName}>
                      {idx + 1}. {cat.fullName}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      {cat.total} act.
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[var(--text-secondary)] italic py-2">
                  Aucune activité de catégorie enregistrée.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>Dossiers actifs :</span>
              <span className="font-bold text-[var(--text-main)] font-mono">{categories.length}</span>
            </div>
          </div>

          {/* Bloc 3 : Date du dernier prompt optimisé */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>Dernier prompt optimisé</span>
              </span>
              {quickStatsWidget.lastOptimizedRelative && (
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/25 px-2 py-0.5 rounded">
                  {quickStatsWidget.lastOptimizedRelative}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {quickStatsWidget.lastOptimized ? (
                <>
                  <div className="text-sm font-bold text-[var(--text-main)] truncate" title={quickStatsWidget.lastOptimized.title}>
                    {quickStatsWidget.lastOptimized.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-mono text-[11px] font-semibold text-[var(--text-main)]">
                      {quickStatsWidget.lastOptimizedFormattedDate}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-[var(--text-secondary)] italic py-2">
                  Aucun prompt optimisé récemment.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
              {quickStatsWidget.lastOptimized ? (
                <button
                  type="button"
                  onClick={() => openPromptInOptimizer(quickStatsWidget.lastOptimized!.generated_content, quickStatsWidget.lastOptimized!.title)}
                  className="w-full text-center py-1 rounded bg-[var(--bg-surface-secondary)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-main)] font-semibold transition-colors cursor-pointer text-[11px]"
                >
                  Ouvrir dans l’Optimiseur
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('optimizer')}
                  className="w-full text-center py-1 rounded bg-[var(--bg-surface-secondary)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-main)] font-semibold transition-colors cursor-pointer text-[11px]"
                >
                  Accéder à l’Optimiseur
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau de statistiques réelles (SQLite) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-secondary)] font-medium">
            Prompts enregistrés
          </div>
          <div className="text-2xl font-display font-bold text-[var(--text-main)] mt-1.5 font-mono tabular-nums">
            {stats?.totalPrompts ?? prompts.length}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Dossier principal : {topCategoryName}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-secondary)] font-medium">
            Prompts favoris
          </div>
          <div className="text-2xl font-display font-bold text-[var(--text-main)] mt-1.5 font-mono tabular-nums">
            {stats?.favoritePrompts ?? favoritePrompts.length}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Tag dominant : <span className="font-mono">{topTagName}</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-secondary)] font-medium">
            Versions historisées
          </div>
          <div className="text-2xl font-display font-bold text-[var(--text-main)] mt-1.5 font-mono tabular-nums">
            {stats?.totalVersions ?? 0}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Générations & optimisations cumulées
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-secondary)] font-medium">
            Modèles réutilisables
          </div>
          <div className="text-2xl font-display font-bold text-[var(--text-main)] mt-1.5 font-mono tabular-nums">
            {stats?.totalTemplates ?? templates.length}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {categories.length} dossiers métiers actifs
          </div>
        </div>
      </div>

      {/* SECTION ANALYTIQUE RECHARTS : TENDANCES D'UTILISATION PAR CATÉGORIE / TAG & CHRONOLOGIE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Graphique 1 : Évolution temporelle des Générations vs Optimisations (7 derniers jours) */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="text-sm font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Évolution des générations et optimisations (7 jours)</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Volume quotidien de créations initiales (v1) et de révisions d’optimisation (v2+) enregistrées.
              </p>
            </div>
          </div>

          <div className="h-64 w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={0}>
              <AreaChart
                data={timelineChartData}
                margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGenerations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorOptimizations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: axisTextColor, fontSize: 11 }}
                  axisLine={{ stroke: gridStrokeColor }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisTextColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#F0F3F6' : '#1B1F24',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="generations"
                  name="Prompts générés (v1)"
                  stroke={primaryColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGenerations)"
                />
                <Area
                  type="monotone"
                  dataKey="optimizations"
                  name="Prompts optimisés / révisés (v2+)"
                  stroke={secondaryColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOptimizations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique 2 : Répartition par Dossiers métiers ou par Tags les plus générés/optimisés */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="text-sm font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>
                  {analyticsBreakdownMode === 'categories'
                    ? 'Activité par Dossier métier (Catégories)'
                    : 'Activité par Tags métiers (#tags)'}
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Comparaison des générations et optimisations par{' '}
                {analyticsBreakdownMode === 'categories' ? 'dossier métier' : 'tag associé'}.
              </p>
            </div>

            {/* Sélecteur Dossiers métiers vs Tags */}
            <div
              className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] shrink-0"
              role="group"
              aria-label="Basculer entre dossiers métiers et tags"
            >
              <button
                type="button"
                onClick={() => setAnalyticsBreakdownMode('categories')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  analyticsBreakdownMode === 'categories'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Folder className="w-3 h-3 text-[var(--accent-primary)]" />
                <span>Par Dossier métier</span>
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsBreakdownMode('tags')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  analyticsBreakdownMode === 'tags'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <TagIcon className="w-3 h-3 text-[var(--accent-primary)]" />
                <span>Par Tag (#)</span>
              </button>
            </div>
          </div>

          <div className="h-64 w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={0}>
              <BarChart
                data={activeBarData}
                layout="vertical"
                margin={{ top: 5, right: 18, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: axisTextColor, fontSize: 11 }}
                  axisLine={{ stroke: gridStrokeColor }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={135}
                  tick={{ fill: axisTextColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#F0F3F6' : '#1B1F24',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="generations"
                  name="Générations (v1)"
                  stackId="usage"
                  fill={primaryColor}
                  radius={[0, 0, 0, 0]}
                  barSize={16}
                />
                <Bar
                  dataKey="optimizations"
                  name="Optimisations (v2+)"
                  stackId="usage"
                  fill={secondaryColor}
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grille principale : Prompts récents & Favoris */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne 1 & 2 : Prompts récemment utilisés / dernières modifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Prompts récemment modifiés</span>
            </h2>
            <button
              onClick={() => setActiveView('library')}
              className="text-xs font-medium text-[var(--accent-primary)] hover:underline flex items-center gap-1"
            >
              <span>Voir toute la bibliothèque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPrompts.length === 0 ? (
            <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-3">
              <p className="text-sm font-medium text-[var(--text-main)]">
                Votre bibliothèque locale ne contient encore aucun prompt.
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Créez votre premier prompt structuré ou partez d’un modèle prêt à l’emploi pour vos projets Django, React ou vos analyses.
              </p>
              <button
                onClick={startNewPromptDraft}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Créer mon premier prompt</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
              {recentPrompts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-start justify-between gap-4 hover:bg-[var(--bg-surface-secondary)] transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPromptInOptimizer(p.generated_content, p.title)}
                        className="text-sm font-semibold text-[var(--text-main)] hover:text-[var(--accent-primary)] transition-colors text-left leading-snug break-words"
                      >
                        {p.title}
                      </button>
                      {p.is_favorite && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                      {p.description || p.original_input}
                    </p>
                    {/* Zero-pill metadata discipline: unboxed text with · separators */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] pt-0.5">
                      <span>{p.domain}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{p.target_model}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{p.output_format}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(p.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyPrompt(p.generated_content, p.title)}
                      title="Copier le prompt"
                      className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPromptIdForHistory(p.id);
                        setActiveView('history');
                      }}
                      title="Consulter les versions"
                      className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openPromptInOptimizer(p.generated_content, p.title)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-main)] hover:border-[var(--accent-primary)] transition-colors whitespace-nowrap shrink-0"
                    >
                      Ouvrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne 3 : Prompts favoris */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Prompts favoris</span>
            </h2>
          </div>

          {favoritePrompts.length === 0 ? (
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              Aucun favori sélectionné. Cliquez sur l’étoile d’un prompt dans la bibliothèque pour l’épingler ici.
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
              {favoritePrompts.map((fav) => (
                <div key={fav.id} className="p-4 space-y-1.5">
                  <button
                    onClick={() => openPromptInOptimizer(fav.generated_content, fav.title)}
                    className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--accent-primary)] text-left block leading-snug break-words w-full"
                  >
                    {fav.title}
                  </button>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>
                      {fav.domain} · <span className="font-mono">{fav.target_model}</span>
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(fav.generated_content, fav.title)}
                      className="text-[var(--accent-primary)] hover:underline font-medium"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Modèles fréquemment utilisés */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-semibold text-[var(--text-main)] flex items-center gap-2">
            <BookTemplate className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Modèles fréquemment utilisés</span>
          </h2>
          <button
            onClick={() => setActiveView('templates')}
            className="text-xs font-medium text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>Parcourir les {templates.length} modèles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4 hover:border-[var(--accent-primary)] transition-colors"
            >
              <div className="space-y-1.5">
                <h3 className="text-sm font-display font-semibold text-[var(--text-main)]">
                  {tpl.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                <span>
                  {tpl.category_name} · <span className="font-mono">{tpl.output_format}</span>
                </span>
                <button
                  onClick={() => openTemplateInGenerator(tpl, tpl.template_content)}
                  className="font-medium text-[var(--accent-primary)] hover:underline whitespace-nowrap shrink-0"
                >
                  Utiliser ce modèle →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
