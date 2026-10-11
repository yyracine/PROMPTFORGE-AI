import React, { useState, useEffect } from 'react';
import {
  Search,
  Copy,
  Sparkles,
  Edit3,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PromptTemplate } from '../../types/promptforge';

export const TemplatesView: React.FC = () => {
  const {
    templates,
    categories,
    refreshAllData,
    openTemplateInGenerator,
    openPromptInOptimizer,
    addToast,
  } = useWorkspace();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(
    templates[0] || null
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (!activeTemplate && templates.length > 0) {
      setActiveTemplate(templates[0]);
    }
  }, [templates, activeTemplate]);

  useEffect(() => {
    if (activeTemplate) {
      const defaults: Record<string, string> = {};
      for (const v of activeTemplate.variables_schema || []) {
        defaults[v.name] = v.defaultValue || '';
      }
      setVariableValues(defaults);
      setEditedContent(activeTemplate.template_content);
      setIsEditingTemplate(false);
    }
  }, [activeTemplate]);

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Compile template with variable values
  const compiledPrompt = React.useMemo(() => {
    if (!activeTemplate) return '';
    let content = isEditingTemplate ? editedContent : activeTemplate.template_content;
    for (const [k, val] of Object.entries(variableValues)) {
      const regex = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
      content = content.replace(regex, val || `{{${k}}}`);
    }
    return content;
  }, [activeTemplate, variableValues, isEditingTemplate, editedContent]);

  const handleSaveTemplateChanges = async () => {
    if (!activeTemplate) return;
    try {
      const res = await fetch(`/api/templates/${activeTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_content: editedContent,
        }),
      });
      if (res.ok) {
        await refreshAllData();
        setIsEditingTemplate(false);
        addToast('success', 'Modèle mis à jour localement dans SQLite.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
            Bibliothèque de modèles réutilisables ({templates.length})
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Modèles professionnels préchargés et modifiables pour le développement logiciel, l’entrepreneuriat, le marketing et l’analyse.
          </p>
        </div>

        {/* Filtres par catégorie (boutons fonctionnels interactifs) */}
        <div
          className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]"
          role="group"
          aria-label="Filtrer par catégorie"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            }`}
          >
            Tous ({templates.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un modèle (ex: Django, MVP, SEO, Audit)..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
        />
      </div>

      {/* Grille Maître-Détail : Liste des modèles (5 cols) & Configurateur de variables (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-[680px] overflow-y-auto">
          {filteredTemplates.map((tpl) => {
            const active = activeTemplate?.id === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setActiveTemplate(tpl)}
                className={`w-full text-left p-4 transition-colors space-y-1.5 ${
                  active
                    ? 'bg-[var(--bg-surface-secondary)]'
                    : 'hover:bg-[var(--bg-surface-secondary)]/60'
                }`}
              >
                <div className="text-sm font-display font-semibold text-[var(--text-main)]">
                  {tpl.title}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {tpl.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] pt-0.5">
                  <span>{tpl.category_name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{tpl.target_model}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{tpl.output_format}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panneau de personnalisation du modèle */}
        <div className="lg:col-span-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-5">
          {activeTemplate ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-[var(--text-main)]">
                    {activeTemplate.title}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {activeTemplate.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pt-1">
                    <span>{activeTemplate.category_name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{activeTemplate.target_model}</span>
                    <span aria-hidden="true">·</span>
                    <span>Format : {activeTemplate.output_format}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsEditingTemplate((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingTemplate ? 'Aperçu compilé' : 'Modifier la trame'}</span>
                  </button>

                  {isEditingTemplate && (
                    <button
                      onClick={handleSaveTemplateChanges}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Sauvegarder</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Variables personnalisables */}
              {activeTemplate.variables_schema && activeTemplate.variables_schema.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-3">
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Variables personnalisables du modèle :
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {activeTemplate.variables_schema.map((v) => (
                      <div key={v.name} className="space-y-1">
                        <label className="block text-xs font-medium text-[var(--text-main)]">
                          {v.label}{' '}
                          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                            ({`{{${v.name}}}`})
                          </span>
                        </label>
                        <input
                          type="text"
                          value={variableValues[v.name] || ''}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [v.name]: e.target.value,
                            }))
                          }
                          placeholder={v.placeholder}
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenu du prompt avec variables injectées */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>
                    {isEditingTemplate
                      ? 'Édition de la trame du modèle (utilisez {{nom_variable}})'
                      : 'Prompt prêt à l’emploi (variables injectées en temps réel)'}
                  </span>
                  {activeTemplate.example_output && (
                    <span className="truncate max-w-xs">
                      Sortie attendue : {activeTemplate.example_output}
                    </span>
                  )}
                </div>

                {isEditingTemplate ? (
                  <textarea
                    rows={14}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)]"
                  />
                ) : (
                  <pre className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                    {compiledPrompt}
                  </pre>
                )}
              </div>

              {/* Actions d'utilisation du modèle */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(compiledPrompt);
                    addToast('success', 'Prompt compilé copié dans le presse-papiers.');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>Copier le prompt compilé</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openPromptInOptimizer(compiledPrompt, activeTemplate.title)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)] whitespace-nowrap shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                    <span>Envoyer dans l’Optimiseur</span>
                  </button>

                  <button
                    onClick={() => openTemplateInGenerator(activeTemplate, compiledPrompt)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Utiliser comme point de départ</span>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
