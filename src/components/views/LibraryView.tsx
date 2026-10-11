import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Star,
  Copy,
  Edit3,
  Trash2,
  Files,
  History,
  SlidersHorizontal,
  BookTemplate,
  Plus,
  Download,
  Upload,
  FolderPlus,
  Folder,
  Tag as TagIcon,
  Save,
  X,
  RotateCcw,
  FileJson,
  Loader2,
  CheckCircle2,
  GitCompare,
  Clock,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PROFESSIONAL_DOMAINS, TARGET_PROFILES } from '../../lib/constants';
import {
  exportVersionHistoryToCsv,
  exportVersionHistoryToPdf,
} from '../../lib/reportExporter';
import { Category, PromptRecord, PromptVersion } from '../../types/promptforge';

const PRESET_BUSINESS_FOLDERS: { name: string; description: string }[] = [
  {
    name: 'Marketing',
    description: 'Campagnes d’acquisition, landing pages, emails et copywriting.',
  },
  {
    name: 'Technique & DevOps',
    description: 'Architecture système, scripts PowerShell, sécurité et bases de données.',
  },
  {
    name: 'SEO & Rédaction Web',
    description: 'Cocons sémantiques, mots-clés, balises méta et articles optimisés.',
  },
  {
    name: 'Produit & UX',
    description: 'Spécifications fonctionnelles, parcours utilisateurs et design system.',
  },
  {
    name: 'Ventes & CRM',
    description: 'Séquences de prospection B2B, traitement des objections et qualification.',
  },
  {
    name: ' Juridique & Conformité',
    description: 'CGU/CGV, RGPD, contrats SaaS et clauses de confidentialité.',
  },
];

const PRESET_BUSINESS_TAGS: string[] = [
  'Marketing',
  'Technique',
  'SEO',
  'Landing-Page',
  'Copywriting',
  'Architecture',
  'Django',
  'Full-Stack',
  'Video-IA',
  'SaaS',
  'Acquisition',
  'Prompt-Agent',
];

export const LibraryView: React.FC = () => {
  const {
    prompts,
    categories,
    tags,
    refreshAllData,
    openPromptInOptimizer,
    setSelectedPromptIdForHistory,
    setActiveView,
    startNewPromptDraft,
    addToast,
  } = useWorkspace();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  // Selected prompt for viewing/editing
  const [activePrompt, setActivePrompt] = useState<PromptRecord | null>(
    prompts[0] || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('cat-dev');
  const [editTargetModel, setEditTargetModel] = useState('claude-code');
  const [editDomain, setEditDomain] = useState('Développement logiciel');
  const [editTags, setEditTags] = useState('');
  const [editChangeSummary, setEditChangeSummary] = useState('Modification manuelle');

  // Quick inline tag & folder assignment on the active prompt
  const [quickTagInput, setQuickTagInput] = useState('');
  const [isUpdatingOrganization, setIsUpdatingOrganization] = useState(false);

  // Version management state for the active prompt directly inside the Library
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [selectedVersionToInspect, setSelectedVersionToInspect] =
    useState<PromptVersion | null>(null);
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);

  // Delete confirmation modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Customizable Folders & Tags Manager Panel
  const [showOrganizationManager, setShowOrganizationManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [editingFolderDesc, setEditingFolderDesc] = useState('');
  const [newGlobalTagInput, setNewGlobalTagInput] = useState('');

  // Export & Import JSON state
  const [isExportingLibrary, setIsExportingLibrary] = useState(false);
  const [isExportingSingleJson, setIsExportingSingleJson] = useState(false);
  const [pendingImportPayload, setPendingImportPayload] = useState<any | null>(null);
  const [importInspection, setImportInspection] = useState<{
    totalIncoming: number;
    duplicateCount: number;
    duplicateTitles: string[];
  } | null>(null);
  const [importStrategy, setImportStrategy] = useState<'duplicate' | 'skip' | 'overwrite'>(
    'duplicate'
  );
  const [isApplyingImport, setIsApplyingImport] = useState(false);

  // Keep activePrompt synced if prompts list updates and none selected
  useEffect(() => {
    if (!activePrompt && prompts.length > 0) {
      setActivePrompt(prompts[0]);
    } else if (activePrompt) {
      const updatedInList = prompts.find((p) => p.id === activePrompt.id);
      if (updatedInList) {
        const tagsChanged =
          JSON.stringify(updatedInList.tags || []) !== JSON.stringify(activePrompt.tags || []);
        if (
          updatedInList.updated_at !== activePrompt.updated_at ||
          updatedInList.category_id !== activePrompt.category_id ||
          tagsChanged
        ) {
          setActivePrompt(updatedInList);
        }
      }
    }
  }, [prompts, activePrompt]);

  // Fetch version history for the active prompt
  const fetchVersionsForPrompt = useCallback(async (promptId: string) => {
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}`);
      if (res.ok) {
        const data = await res.json();
        const versionsList: PromptVersion[] = data.versions || [];
        setPromptVersions(versionsList);
        setSelectedVersionToInspect(null);
      }
    } catch (err) {
      console.error('Failed to fetch versions for prompt:', err);
    } finally {
      setIsLoadingVersions(false);
    }
  }, []);

  useEffect(() => {
    if (activePrompt?.id) {
      fetchVersionsForPrompt(activePrompt.id);
    } else {
      setPromptVersions([]);
      setSelectedVersionToInspect(null);
    }
  }, [activePrompt?.id, fetchVersionsForPrompt]);

  // Restore a specific version inside the Library without overwriting history
  const handleRestoreVersionInLibrary = async (ver: PromptVersion) => {
    if (!activePrompt) return;
    setIsRestoringVersion(true);
    try {
      const res = await fetch(
        `/api/prompts/${activePrompt.id}/versions/${ver.id}/restore`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        await refreshAllData();
        await fetchVersionsForPrompt(activePrompt.id);
        setSelectedVersionToInspect(null);
        setShowVersionCompare(false);
        addToast(
          'success',
          `Version v${ver.version_number} restaurée en tant que nouvelle version v${data.restoredVersionNumber}.`
        );
      } else {
        const errData = await res.json();
        addToast('error', errData.error || 'Échec de la restauration de version.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsRestoringVersion(false);
    }
  };

  // Lookup helpers for human-readable category & model names
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const modelMap = useMemo(() => {
    const map = new Map<string, string>();
    TARGET_PROFILES.forEach((tp) => map.set(tp.id, tp.name));
    return map;
  }, []);

  // Count prompts per category & model & tag for contextual navigation counters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: prompts.length };
    for (const c of categories) counts[c.id] = 0;
    for (const p of prompts) {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      }
    }
    return counts;
  }, [prompts, categories]);

  const modelCounts = useMemo(() => {
    const counts: Record<string, number> = { all: prompts.length };
    for (const tp of TARGET_PROFILES) counts[tp.id] = 0;
    for (const p of prompts) {
      if (p.target_model) {
        counts[p.target_model] = (counts[p.target_model] || 0) + 1;
      }
    }
    return counts;
  }, [prompts]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of prompts) {
      for (const t of p.tags || []) {
        const key = t.trim().toLowerCase();
        if (key) counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, [prompts]);

  // All unique tags across saved prompts and global tags table
  const allAvailableTags = useMemo(() => {
    const map = new Map<string, string>();
    tags.forEach((t) => {
      if (t.name?.trim()) {
        map.set(t.name.trim().toLowerCase(), t.name.trim());
      }
    });
    prompts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        if (t.trim()) map.set(t.trim().toLowerCase(), t.trim());
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [prompts, tags]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedModel !== 'all' ||
    selectedDomain !== 'all' ||
    selectedTag !== 'all' ||
    onlyFavorites;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedModel('all');
    setSelectedDomain('all');
    setSelectedTag('all');
    setOnlyFavorites(false);
  };

  // Filter & Sort logic (accent-insensitive search across title, description, content, domain, category name, model name, and tags)
  const normalizeText = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        if (onlyFavorites && !p.is_favorite) return false;
        if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
        if (selectedModel !== 'all' && p.target_model !== selectedModel) return false;
        if (selectedDomain !== 'all' && p.domain !== selectedDomain) return false;
        if (
          selectedTag !== 'all' &&
          !(p.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase())
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = normalizeText(searchQuery.trim());
          const catName = categoryMap.get(p.category_id) || '';
          const modName = modelMap.get(p.target_model) || p.target_model || '';
          const searchable = normalizeText(
            [
              p.title,
              p.description || '',
              p.original_input || '',
              p.generated_content,
              p.domain || '',
              catName,
              modName,
              ...(p.tags || []),
            ].join(' ')
          );
          if (!searchable.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'fr');
        if (sortBy === 'created')
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [
    prompts,
    onlyFavorites,
    selectedCategory,
    selectedModel,
    selectedDomain,
    selectedTag,
    searchQuery,
    sortBy,
    categoryMap,
    modelMap,
  ]);

  const handleSelectPrompt = (p: PromptRecord) => {
    if (isEditing && editContent !== activePrompt?.generated_content) {
      addToast(
        'warning',
        'Enregistrez ou annulez vos modifications en cours avant de changer de prompt.'
      );
      return;
    }
    setActivePrompt(p);
    setIsEditing(false);
    setShowVersionCompare(false);
  };

  const startEditMode = (p: PromptRecord, initialContentOverride?: string, summaryOverride?: string) => {
    setActivePrompt(p);
    setEditTitle(p.title);
    setEditDesc(p.description || '');
    setEditContent(initialContentOverride ?? p.generated_content);
    setEditCategoryId(p.category_id || 'cat-dev');
    setEditTargetModel(p.target_model || 'claude-code');
    setEditDomain(p.domain || 'Développement logiciel');
    setEditTags((p.tags || []).join(', '));
    setEditChangeSummary(summaryOverride || 'Modification manuelle dans la bibliothèque');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activePrompt) return;
    if (!editTitle.trim() || !editContent.trim()) {
      addToast('warning', 'Le titre et le contenu ne peuvent pas être vides.');
      return;
    }

    const profileObj = TARGET_PROFILES.find((tp) => tp.id === editTargetModel);

    try {
      const res = await fetch(`/api/prompts/${activePrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          generated_content: editContent,
          category_id: editCategoryId,
          target_model: editTargetModel,
          target_provider: profileObj?.provider || activePrompt.target_provider,
          domain: editDomain,
          tags: editTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          create_new_version: true,
          mode_used: 'édition-manuelle',
          change_summary: editChangeSummary || 'Modification manuelle',
          is_manual_edit: true,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        await refreshAllData();
        setActivePrompt(updated);
        await fetchVersionsForPrompt(activePrompt.id);
        setIsEditing(false);
        addToast('success', 'Modifications enregistrées et nouvelle version ajoutée à l’historique.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  // Instant folder reassignment without creating a redundant content version
  const handleQuickMoveFolder = async (prompt: PromptRecord, newCategoryId: string) => {
    if (prompt.category_id === newCategoryId) return;
    setIsUpdatingOrganization(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: newCategoryId,
          create_new_version: false,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        await refreshAllData();
        setActivePrompt(updated);
        const folderName = categoryMap.get(newCategoryId) || 'Dossier';
        addToast('success', `Prompt classé dans le dossier « ${folderName} ».`);
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsUpdatingOrganization(false);
    }
  };

  // Instant tag addition/removal on the active prompt
  const handleQuickUpdateTags = async (prompt: PromptRecord, nextTags: string[]) => {
    setIsUpdatingOrganization(true);
    try {
      const cleanTags = Array.from(
        new Set(nextTags.map((t) => t.trim().replace(/^#+/, '')).filter(Boolean))
      );
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: cleanTags,
          create_new_version: false,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        await refreshAllData();
        setActivePrompt(updated);
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsUpdatingOrganization(false);
    }
  };

  const handleAddTagToActivePrompt = async (tagToAdd: string) => {
    if (!activePrompt) return;
    const cleaned = tagToAdd.trim().replace(/^#+/, '');
    if (!cleaned) return;
    const current = activePrompt.tags || [];
    if (current.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setQuickTagInput('');
      return;
    }
    await handleQuickUpdateTags(activePrompt, [...current, cleaned]);
    setQuickTagInput('');
    addToast('success', `Tag #${cleaned} associé au prompt.`);
  };

  const handleRemoveTagFromActivePrompt = async (tagToRemove: string) => {
    if (!activePrompt) return;
    const current = activePrompt.tags || [];
    const next = current.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    await handleQuickUpdateTags(activePrompt, next);
    addToast('success', `Tag #${tagToRemove} retiré du prompt.`);
  };

  const handleToggleFavorite = async (p: PromptRecord) => {
    try {
      const res = await fetch(`/api/prompts/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_favorite: !p.is_favorite,
          create_new_version: false,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        await refreshAllData();
        if (activePrompt?.id === p.id) setActivePrompt(updated);
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleDuplicate = async (p: PromptRecord) => {
    try {
      const res = await fetch(`/api/prompts/${p.id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const duplicated = await res.json();
        await refreshAllData();
        setActivePrompt(duplicated);
        addToast('success', `Prompt dupliqué : « ${duplicated.title} ».`);
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleDeleteConfirmed = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshAllData();
        setConfirmDeleteId(null);
        if (activePrompt?.id === id) {
          setActivePrompt(null);
          setIsEditing(false);
        }
        addToast('success', 'Prompt supprimé de la base SQLite.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleConvertToTemplate = async (p: PromptRecord) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Modèle : ${p.title}`,
          description: p.description || 'Créé depuis la bibliothèque personnelle',
          category_id: p.category_id || 'cat-dev',
          template_content: p.generated_content,
          variables_schema: [],
          output_format: p.output_format,
          target_provider: p.target_provider,
          target_model: p.target_model,
        }),
      });
      if (res.ok) {
        await refreshAllData();
        addToast('success', 'Prompt ajouté à la bibliothèque de modèles réutilisables.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  // Folder (Category) CRUD operations
  const handleCreateCategory = async (nameOverride?: string, descOverride?: string) => {
    const targetName = (nameOverride ?? newCategoryName).trim();
    const targetDesc = (descOverride ?? newCategoryDesc).trim();
    if (!targetName) {
      addToast('warning', 'Veuillez saisir un nom de dossier métier.');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName, description: targetDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Erreur lors de la création du dossier.');
        return;
      }
      await refreshAllData();
      if (!nameOverride) {
        setNewCategoryName('');
        setNewCategoryDesc('');
      }
      addToast('success', `Dossier métier « ${data.name} » créé.`);
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleSaveRenameFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) {
      addToast('warning', 'Le nom du dossier ne peut pas être vide.');
      return;
    }
    try {
      const res = await fetch(`/api/categories/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingFolderName.trim(),
          description: editingFolderDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Impossible de renommer ce dossier.');
        return;
      }
      await refreshAllData();
      setEditingFolderId(null);
      addToast('success', `Dossier renommé en « ${data.name} ».`);
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleDeleteFolder = async (folder: Category) => {
    if (folder.id === 'cat-dev') {
      addToast('warning', 'Le dossier principal « Développement logiciel » est protégé.');
      return;
    }
    try {
      const res = await fetch(`/api/categories/${folder.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Impossible de supprimer ce dossier.');
        return;
      }
      if (selectedCategory === folder.id) {
        setSelectedCategory('all');
      }
      await refreshAllData();
      addToast(
        'success',
        `Dossier « ${folder.name} » supprimé (prompts rattachés à Développement logiciel).`
      );
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  // Global Tag CRUD operations
  const handleCreateGlobalTag = async (tagNameOverride?: string) => {
    const raw = (tagNameOverride ?? newGlobalTagInput).trim().replace(/^#+/, '');
    if (!raw) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: raw }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Impossible de créer ce tag.');
        return;
      }
      await refreshAllData();
      if (!tagNameOverride) setNewGlobalTagInput('');
      addToast('success', `Tag métier #${data.name} enregistré.`);
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleDeleteGlobalTag = async (tagName: string) => {
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(tagName)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedTag.toLowerCase() === tagName.toLowerCase()) {
          setSelectedTag('all');
        }
        await refreshAllData();
        addToast('success', `Tag #${tagName} supprimé de la bibliothèque.`);
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  /**
   * Export d'un prompt individuel au format .TXT, .MD ou .JSON complet (incluant ses versions SQLite)
   */
  const handleExportSingle = async (p: PromptRecord, format: 'txt' | 'md' | 'json') => {
    const slug = p.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (format === 'json') {
      setIsExportingSingleJson(true);
      try {
        const res = await fetch(`/api/prompts/${p.id}`);
        const fullPrompt = res.ok ? await res.json() : p;
        const jsonPayload = {
          schemaVersion: '1.0.0',
          application: 'PromptForge AI',
          exportType: 'single_prompt',
          exportedAt: new Date().toISOString(),
          containsSecrets: false,
          categoryName: categoryMap.get(p.category_id) || 'Non classé',
          targetModelName: modelMap.get(p.target_model) || p.target_model,
          data: {
            prompts: [fullPrompt],
            versions: fullPrompt.versions || [],
          },
          ...fullPrompt,
        };
        const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptforge-${slug || 'prompt'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast('success', `Prompt « ${p.title} » exporté au format .JSON portable.`);
      } catch (err: any) {
        addToast('error', `Erreur lors de l'export JSON : ${err.message}`);
      } finally {
        setIsExportingSingleJson(false);
      }
      return;
    }

    let content = p.generated_content;
    let mime = 'text/plain;charset=utf-8';
    if (format === 'md') {
      mime = 'text/markdown;charset=utf-8';
      content = `# ${p.title}\n\n${p.description ? `> ${p.description}\n\n` : ''}${p.generated_content}`;
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'prompt'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', `Prompt exporté au format .${format.toUpperCase()}.`);
  };

  /**
   * Export de toute la bibliothèque (ou de la sélection filtrée) au format JSON
   */
  const handleExportLibraryJson = async (scope: 'all' | 'filtered') => {
    setIsExportingLibrary(true);
    try {
      const dateStamp = new Date().toISOString().slice(0, 10);
      if (scope === 'filtered') {
        const filteredPayload = {
          schemaVersion: '1.0.0',
          application: 'PromptForge AI',
          exportType: 'filtered_library',
          exportedAt: new Date().toISOString(),
          containsSecrets: false,
          totalPrompts: filteredPrompts.length,
          data: {
            prompts: filteredPrompts,
            categories,
          },
        };
        const blob = new Blob([JSON.stringify(filteredPayload, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptforge-selection-${filteredPrompts.length}-prompts-${dateStamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast(
          'success',
          `${filteredPrompts.length} prompt(s) filtré(s) exporté(s) au format .JSON.`
        );
        return;
      }

      const res = await fetch('/api/backup/export');
      if (!res.ok) {
        addToast('error', "Impossible de générer l'export complet de la bibliothèque.");
        return;
      }
      const backupData = await res.json();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptforge-bibliotheque-complete-${dateStamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(
        'success',
        `Bibliothèque complète (${prompts.length} prompts + historique) exportée au format .JSON.`
      );
    } catch (err: any) {
      addToast('error', `Erreur d'export JSON : ${err.message}`);
    } finally {
      setIsExportingLibrary(false);
    }
  };

  /**
   * Import d'un fichier JSON (prompt individuel ou bibliothèque complète) avec détection des doublons
   */
  const handleSelectImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/backup/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const inspection = await res.json();
      if (!res.ok || !inspection.valid) {
        addToast('error', inspection.error || 'Fichier JSON non reconnu.');
        return;
      }
      setPendingImportPayload(parsed);
      setImportInspection(inspection);
    } catch (err: any) {
      addToast('error', `Fichier JSON invalide : ${err.message}`);
    }
  };

  const handleConfirmImportJson = async () => {
    if (!pendingImportPayload) return;
    setIsApplyingImport(true);
    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: pendingImportPayload,
          strategy: importStrategy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || "Erreur lors de l'importation JSON.");
        return;
      }
      await refreshAllData();
      setPendingImportPayload(null);
      setImportInspection(null);
      addToast(
        'success',
        `Import JSON terminé : ${data.importedCount} prompt(s) intégré(s) (${data.skippedCount} ignoré(s)).`
      );
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsApplyingImport(false);
    }
  };

  const latestVersionNumber = promptVersions[0]?.version_number || 1;
  const displayedContent = selectedVersionToInspect
    ? selectedVersionToInspect.content
    : activePrompt?.generated_content || '';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête avec actions d'export/import JSON et gestionnaire de dossiers/tags */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
            Bibliothèque personnelle ({prompts.length})
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Organisez vos prompts par dossiers métiers personnalisables (Marketing, Technique, SEO...) et par tags, consultez leurs versions ou exportez-les.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={importFileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleSelectImportFile}
            className="hidden"
          />

          <button
            onClick={() => importFileInputRef.current?.click()}
            title="Importer un prompt ou une bibliothèque JSON"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Importer JSON</span>
          </button>

          {hasActiveFilters && filteredPrompts.length > 0 && filteredPrompts.length < prompts.length && (
            <button
              onClick={() => handleExportLibraryJson('filtered')}
              disabled={isExportingLibrary}
              title="Exporter uniquement les prompts correspondant aux filtres actifs"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
            >
              <FileJson className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Exporter la sélection ({filteredPrompts.length})</span>
            </button>
          )}

          <button
            onClick={() => handleExportLibraryJson('all')}
            disabled={isExportingLibrary || prompts.length === 0}
            title="Exporter toute la bibliothèque SQLite au format JSON pour sauvegarde externe ou partage entre instances"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            {isExportingLibrary ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            )}
            <span>Exporter toute la bibliothèque (.JSON)</span>
          </button>

          <button
            onClick={() => setShowOrganizationManager((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              showOrganizationManager
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-[var(--text-main)]'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Gérer Dossiers & Tags ({categories.length})</span>
          </button>

          <button
            onClick={startNewPromptDraft}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau prompt</span>
          </button>
        </div>
      </div>

      {/* Panneau de validation avant Import JSON (avec gestion des doublons) */}
      {importInspection && (
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-primary)] space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Fichier JSON prêt à être importé dans la bibliothèque</span>
              </div>
              <p className="text-xs text-[var(--text-main)]">
                <strong>{importInspection.totalIncoming}</strong> prompt(s) détecté(s) dans le fichier.
                {importInspection.duplicateCount > 0 && (
                  <span className="text-[var(--text-secondary)]">
                    {' '}
                    — dont <strong>{importInspection.duplicateCount}</strong> portant un titre déjà présent ({importInspection.duplicateTitles.slice(0, 3).join(', ')}).
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setPendingImportPayload(null);
                setImportInspection(null);
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[var(--text-secondary)] font-medium">
                En cas de doublon :
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-main)]">
                <input
                  type="radio"
                  name="importStrategy"
                  checked={importStrategy === 'duplicate'}
                  onChange={() => setImportStrategy('duplicate')}
                />
                <span>Conserver les deux (suffixe « Importé »)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-main)]">
                <input
                  type="radio"
                  name="importStrategy"
                  checked={importStrategy === 'skip'}
                  onChange={() => setImportStrategy('skip')}
                />
                <span>Ignorer les doublons</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-main)]">
                <input
                  type="radio"
                  name="importStrategy"
                  checked={importStrategy === 'overwrite'}
                  onChange={() => setImportStrategy('overwrite')}
                />
                <span>Mettre à jour et créer une nouvelle version</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPendingImportPayload(null);
                  setImportInspection(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmImportJson}
                disabled={isApplyingImport}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
              >
                {isApplyingImport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer l’importation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU GESTIONNAIRE DE DOSSIERS MÉTIERS PERSONNALISABLES & TAGS */}
      {showOrganizationManager && (
        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-primary)]/50 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-base font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <Folder className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Organisation par Dossiers métiers & Tags personnalisables</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Créez, renommez ou supprimez vos dossiers métiers (ex: Marketing, Technique, SEO, Produit) et vos tags transversaux.
              </p>
            </div>
            <button
              onClick={() => setShowOrganizationManager(false)}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne 1 : Gestion des Dossiers Métiers (Catégories) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-semibold text-[var(--text-main)] uppercase tracking-wider">
                  1. Dossiers métiers ({categories.length})
                </span>
              </div>

              {/* Formulaire de création d'un nouveau dossier */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom du dossier (ex: SEO, Produit, Juridique...)"
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                  <input
                    type="text"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Description métier (optionnelle)..."
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-[var(--text-secondary)] mr-1">
                      Suggestions rapides :
                    </span>
                    {PRESET_BUSINESS_FOLDERS.map((preset) => {
                      const exists = categories.some(
                        (c) => c.name.toLowerCase() === preset.name.trim().toLowerCase()
                      );
                      if (exists) return null;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleCreateCategory(preset.name.trim(), preset.description)}
                          className="px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                        >
                          + {preset.name.trim()}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCreateCategory()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium whitespace-nowrap shrink-0"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Créer le dossier</span>
                  </button>
                </div>
              </div>

              {/* Liste des dossiers existants avec renommage et suppression */}
              <div className="rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-[260px] overflow-y-auto">
                {categories.map((folder) => {
                  const count = categoryCounts[folder.id] || 0;
                  const isBeingEdited = editingFolderId === folder.id;

                  return (
                    <div
                      key={folder.id}
                      className="p-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)]/50 transition-colors"
                    >
                      {isBeingEdited ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editingFolderName}
                              onChange={(e) => setEditingFolderName(e.target.value)}
                              className="px-2.5 py-1 rounded bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                            />
                            <input
                              type="text"
                              value={editingFolderDesc}
                              onChange={(e) => setEditingFolderDesc(e.target.value)}
                              placeholder="Description..."
                              className="px-2.5 py-1 rounded bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingFolderId(null)}
                              className="px-2.5 py-1 rounded border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveRenameFolder(folder.id)}
                              className="px-3 py-1 rounded bg-[var(--accent-primary)] text-white text-[11px] font-medium"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
                              <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                              <span>{folder.name}</span>
                              <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                                ({count} prompt{count > 1 ? 's' : ''})
                              </span>
                            </div>
                            {folder.description && (
                              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">
                                {folder.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFolderId(folder.id);
                                setEditingFolderName(folder.name);
                                setEditingFolderDesc(folder.description || '');
                              }}
                              title="Renommer ou modifier ce dossier"
                              className="p-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {folder.id !== 'cat-dev' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteFolder(folder)}
                                title="Supprimer ce dossier"
                                className="p-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--status-error)]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colonne 2 : Gestion des Tags Métiers Personnalisables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-semibold text-[var(--text-main)] uppercase tracking-wider">
                  2. Catalogue de Tags métiers ({allAvailableTags.length})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newGlobalTagInput}
                    onChange={(e) => setNewGlobalTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateGlobalTag();
                      }
                    }}
                    placeholder="Nouveau tag métier (ex: SEO, Marketing, Technique, Audit...)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateGlobalTag()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium whitespace-nowrap shrink-0"
                  >
                    <TagIcon className="w-3.5 h-3.5" />
                    <span>Créer le tag</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-[var(--text-secondary)] mr-1">
                    Tags métiers recommandés :
                  </span>
                  {PRESET_BUSINESS_TAGS.map((presetTag) => {
                    const exists = allAvailableTags.some(
                      (t) => t.toLowerCase() === presetTag.toLowerCase()
                    );
                    if (exists) return null;
                    return (
                      <button
                        key={presetTag}
                        type="button"
                        onClick={() => handleCreateGlobalTag(presetTag)}
                        className="px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                      >
                        +#{presetTag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5 max-h-[260px] overflow-y-auto">
                {allAvailableTags.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Aucun tag enregistré. Ajoutez des tags ci-dessus pour organiser vos prompts.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allAvailableTags.map((tag) => {
                      const count = tagCounts[tag.toLowerCase()] || 0;
                      const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                      return (
                        <div
                          key={tag}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${
                            isSelected
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] text-[var(--text-main)]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTag((prev) =>
                                prev.toLowerCase() === tag.toLowerCase() ? 'all' : tag
                              )
                            }
                            className="hover:underline"
                          >
                            #{tag} ({count})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGlobalTag(tag)}
                            title={`Supprimer le tag #${tag}`}
                            className="text-[var(--text-secondary)] hover:text-[var(--status-error)]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU DE RECHERCHE MULTICRITÈRE ET DE FILTRAGE PAR DOSSIER MÉTIER / MODÈLE / TAG */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-subtle)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative flex items-center">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, contenu, #tag, dossier métier ou modèle..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                title="Effacer la recherche"
                className="absolute right-2.5 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrer par dossier métier"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="all">Tous les dossiers ({prompts.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({categoryCounts[c.id] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              aria-label="Filtrer par modèle cible"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="all">Tous les modèles ({prompts.length})</option>
              {TARGET_PROFILES.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.name} ({modelCounts[tp.id] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              aria-label="Filtrer par domaine"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="all">Tous les domaines</option>
              {PROFESSIONAL_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Trier les prompts"
              className="flex-1 px-2.5 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="updated">Récents</option>
              <option value="created">Création</option>
              <option value="title">A → Z</option>
            </select>

            <button
              onClick={() => setOnlyFavorites((prev) => !prev)}
              title="Afficher uniquement les favoris"
              className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 shrink-0 ${
                onlyFavorites
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-500'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ligne 2 : Navigation rapide par Dossiers métiers et par Modèle cible */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] mr-1 flex items-center gap-1">
              <Folder className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>Dossiers métiers :</span>
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Tous ({prompts.length})
            </button>
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === cat.id ? 'all' : cat.id))
                  }
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] mr-1">
              Modèles :
            </span>
            <button
              onClick={() => setSelectedModel('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedModel === 'all'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Tous
            </button>
            {TARGET_PROFILES.map((tp) => {
              const count = modelCounts[tp.id] || 0;
              return (
                <button
                  key={tp.id}
                  onClick={() => setSelectedModel((prev) => (prev === tp.id ? 'all' : tp.id))}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                    selectedModel === tp.id
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {tp.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Ligne 3 : Filtre par Tag métier & Barre d'état des résultats */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] mr-1 flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>Tags métiers :</span>
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                selectedTag === 'all'
                  ? 'text-[var(--accent-primary)] font-semibold underline'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              Tous
            </button>
            {allAvailableTags.map((tag) => {
              const count = tagCounts[tag.toLowerCase()] || 0;
              return (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTag((prev) =>
                      prev.toLowerCase() === tag.toLowerCase() ? 'all' : tag
                    )
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    selectedTag.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  #{tag} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] font-mono tabular-nums text-[var(--text-secondary)]">
              {filteredPrompts.length} sur {prompts.length} prompt{prompts.length > 1 ? 's' : ''} affiché{filteredPrompts.length > 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser les filtres</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vue Maître-Détail : Liste (5 cols) & Lecteur/Éditeur + Classement Dossier/Tags + Historique des versions (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Liste des prompts */}
        <div className="lg:col-span-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-[820px] overflow-y-auto">
          {filteredPrompts.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Aucun prompt enregistré ne correspond aux critères de recherche ou aux filtres sélectionnés.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:border-[var(--accent-primary)]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Afficher tous les prompts ({prompts.length})</span>
                </button>
              )}
            </div>
          ) : (
            filteredPrompts.map((p) => {
              const selected = activePrompt?.id === p.id;
              const categoryLabel = categoryMap.get(p.category_id) || 'Non classé';
              const modelLabel = modelMap.get(p.target_model) || p.target_model;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPrompt(p)}
                  className={`p-4 cursor-pointer transition-colors space-y-1.5 ${
                    selected
                      ? 'bg-[var(--bg-surface-secondary)] border-l-2 border-l-[var(--accent-primary)]'
                      : 'hover:bg-[var(--bg-surface-secondary)]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-display font-semibold text-[var(--text-main)] leading-snug">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingle(p, 'json');
                        }}
                        title="Exporter ce prompt au format .JSON"
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(p);
                        }}
                        title="Ajouter ou retirer des favoris"
                        className="p-1 text-[var(--text-secondary)] hover:text-amber-500"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            p.is_favorite ? 'text-amber-500 fill-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {p.description || p.original_input}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)] pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(p.category_id);
                      }}
                      title={`Filtrer par le dossier métier : ${categoryLabel}`}
                      className="inline-flex items-center gap-1 font-medium text-[var(--text-main)] hover:text-[var(--accent-primary)] hover:underline"
                    >
                      <Folder className="w-3 h-3 text-[var(--accent-primary)]" />
                      <span>{categoryLabel}</span>
                    </button>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModel(p.target_model);
                      }}
                      title={`Filtrer par le modèle : ${modelLabel}`}
                      className="font-mono hover:text-[var(--accent-primary)] hover:underline"
                    >
                      {modelLabel}
                    </button>
                    {p.tags && p.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <div className="flex flex-wrap items-center gap-1">
                          {p.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                              className="font-mono text-[11px] text-[var(--accent-primary)] hover:underline"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panneau de détail, d'organisation rapide (Dossier & Tags), d'édition et de gestion des versions */}
        <div className="lg:col-span-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-5">
          {!activePrompt ? (
            <div className="py-20 text-center text-sm text-[var(--text-secondary)]">
              Sélectionnez un prompt dans la liste pour le consulter, le classer par dossier/tags, gérer ses versions ou l’exporter.
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h2 className="text-base font-display font-semibold text-[var(--text-main)]">
                    Créer une nouvelle révision (v{latestVersionNumber + 1})
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    L’enregistrement ajoutera une nouvelle version horodatée sans écraser les versions précédentes (v1 à v{latestVersionNumber}).
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  Annuler
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--text-main)]">Titre</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--text-main)]">
                    Dossier métier (Catégorie)
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--text-main)]">
                    Modèle cible
                  </label>
                  <select
                    value={editTargetModel}
                    onChange={(e) => setEditTargetModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  >
                    {TARGET_PROFILES.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--text-main)]">
                    Domaine
                  </label>
                  <select
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  >
                    {PROFESSIONAL_DOMAINS.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Description courte
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Contenu du prompt
                </label>
                <textarea
                  rows={14}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    Tags métiers (séparés par virgule)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    Note de version (Motif de la révision v{latestVersionNumber + 1})
                  </label>
                  <input
                    type="text"
                    value={editChangeSummary}
                    onChange={(e) => setEditChangeSummary(e.target.value)}
                    placeholder="Ex: Ajout de contraintes de sécurité..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer la version v{latestVersionNumber + 1}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* En-tête du prompt actif */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-display font-bold text-[var(--text-main)]">
                      {activePrompt.title}
                    </h2>
                    <span className="font-mono text-xs font-semibold text-[var(--accent-primary)] tabular-nums">
                      v{selectedVersionToInspect ? selectedVersionToInspect.version_number : latestVersionNumber}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-main)]">
                      {categoryMap.get(activePrompt.category_id) || 'Non classé'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activePrompt.domain}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      {modelMap.get(activePrompt.target_model) || activePrompt.target_model}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {promptVersions.length} version{promptVersions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(displayedContent);
                      addToast(
                        'success',
                        selectedVersionToInspect
                          ? `Contenu de la version v${selectedVersionToInspect.version_number} copié.`
                          : 'Prompt copié dans le presse-papiers.'
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium whitespace-nowrap shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </button>

                  <button
                    onClick={() => handleExportSingle(activePrompt, 'json')}
                    disabled={isExportingSingleJson}
                    title="Exporter ce prompt et son historique au format JSON portable"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
                  >
                    {isExportingSingleJson ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
                    ) : (
                      <FileJson className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    )}
                    <span>Exporter JSON</span>
                  </button>

                  <button
                    onClick={() => startEditMode(activePrompt)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(activePrompt)}
                    title="Dupliquer ce prompt"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                  >
                    <Files className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(activePrompt.id)}
                    title="Supprimer ce prompt"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--status-error)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BARRE D'ORGANISATION RAPIDE : DOSSIER MÉTIER & TAGS PERSONNALISABLES */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Sélecteur rapide de Dossier métier */}
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                    <label className="text-xs font-semibold text-[var(--text-main)] whitespace-nowrap">
                      Dossier métier :
                    </label>
                    <select
                      value={activePrompt.category_id}
                      disabled={isUpdatingOrganization}
                      onChange={(e) => handleQuickMoveFolder(activePrompt, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ajout rapide d'un Tag sur le prompt actif */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={quickTagInput}
                      onChange={(e) => setQuickTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTagToActivePrompt(quickTagInput);
                        }
                      }}
                      placeholder="Ajouter un tag (ex: SEO, Marketing)..."
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] w-48"
                    />
                    <button
                      type="button"
                      disabled={!quickTagInput.trim() || isUpdatingOrganization}
                      onClick={() => handleAddTagToActivePrompt(quickTagInput)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium disabled:opacity-40 whitespace-nowrap shrink-0"
                    >
                      + Tag
                    </button>
                  </div>
                </div>

                {/* Liste des tags actifs sur ce prompt + suggestions en 1 clic */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1 mr-1">
                    <TagIcon className="w-3 h-3 text-[var(--accent-primary)]" />
                    <span>Tags associés :</span>
                  </span>

                  {(activePrompt.tags || []).length === 0 ? (
                    <span className="text-[11px] text-[var(--text-secondary)] italic">
                      Aucun tag
                    </span>
                  ) : (
                    (activePrompt.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-main)]"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTagFromActivePrompt(tag)}
                          title={`Retirer le tag #${tag}`}
                          className="text-[var(--text-secondary)] hover:text-[var(--status-error)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}

                  {/* Suggestions rapides de tags non encore attribués */}
                  <div className="flex flex-wrap items-center gap-1 ml-auto">
                    {['Marketing', 'Technique', 'SEO', 'Copywriting', 'SaaS']
                      .filter(
                        (preset) =>
                          !(activePrompt.tags || []).some(
                            (t) => t.toLowerCase() === preset.toLowerCase()
                          )
                      )
                      .slice(0, 4)
                      .map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAddTagToActivePrompt(preset)}
                          title={`Associer rapidement le tag #${preset}`}
                          className="px-1.5 py-0.5 rounded border border-dashed border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                        >
                          +#{preset}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Confirmation explicite avant suppression définitive */}
              {confirmDeleteId === activePrompt.id && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
                  <div className="text-xs text-[var(--text-main)]">
                    Confirmer la suppression définitive de « <strong>{activePrompt.title}</strong> » et de son historique ?
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmed(activePrompt.id)}
                      className="px-3 py-1 rounded-md bg-[var(--status-error)] text-white text-xs font-medium"
                    >
                      Confirmer la suppression
                    </button>
                  </div>
                </div>
              )}

              {/* Bandeau d'alerte lorsqu'une version antérieure est inspectée */}
              {selectedVersionToInspect &&
                selectedVersionToInspect.version_number !== latestVersionNumber && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--accent-primary)]/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        <span>
                          Consultation de la version historique v
                          {selectedVersionToInspect.version_number} (sur v{latestVersionNumber})
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {selectedVersionToInspect.change_summary} — enregistrée le{' '}
                        {new Date(selectedVersionToInspect.created_at).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setShowVersionCompare((prev) => !prev)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-main)]"
                      >
                        <GitCompare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        <span>
                          {showVersionCompare
                            ? 'Masquer la comparaison'
                            : `Comparer avec v${latestVersionNumber}`}
                        </span>
                      </button>

                      <button
                        onClick={() => handleRestoreVersionInLibrary(selectedVersionToInspect)}
                        disabled={isRestoringVersion}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
                      >
                        {isRestoringVersion ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Restaurer cette version</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVersionToInspect(null);
                          setShowVersionCompare(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                      >
                        Revenir à v{latestVersionNumber}
                      </button>
                    </div>
                  </div>
                )}

              {/* Affichage du contenu (Simple ou Comparaison Côte-à-Côte entre la version inspectée et la version courante) */}
              {showVersionCompare && selectedVersionToInspect ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                      <span>Version inspectée : v{selectedVersionToInspect.version_number}</span>
                      <span>{selectedVersionToInspect.content.split(/\s+/).length} mots</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--accent-primary)]/40 font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap max-h-[360px] overflow-y-auto">
                      {selectedVersionToInspect.content}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                      <span>Version actuelle : v{latestVersionNumber}</span>
                      <span>{activePrompt.generated_content.split(/\s+/).length} mots</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap max-h-[360px] overflow-y-auto">
                      {activePrompt.generated_content}
                    </pre>
                  </div>
                </div>
              ) : (
                <pre className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap overflow-x-auto max-h-[360px] overflow-y-auto">
                  {displayedContent}
                </pre>
              )}

              {/* SECTION INTÉGRÉE : HISTORIQUE DES VERSIONS DU PROMPT SÉLECTIONNÉ */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[var(--accent-primary)]" />
                    <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Historique des modifications ({promptVersions.length} version
                      {promptVersions.length > 1 ? 's' : ''})
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        if (!activePrompt || promptVersions.length === 0) return;
                        exportVersionHistoryToCsv(activePrompt, promptVersions);
                        addToast('success', 'Historique des versions exporté au format CSV.');
                      }}
                      disabled={promptVersions.length === 0}
                      title="Exporter l'historique des versions de ce prompt au format CSV"
                      className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-[11px] font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                      <span>Historique CSV</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!activePrompt || promptVersions.length === 0) return;
                        exportVersionHistoryToPdf(activePrompt, promptVersions);
                        addToast('success', 'Rapport d’historique des versions exporté au format PDF.');
                      }}
                      disabled={promptVersions.length === 0}
                      title="Exporter l'historique des versions de ce prompt au format PDF professionnel"
                      className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-[11px] font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
                    >
                      <FileText className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                      <span>Historique PDF</span>
                    </button>

                    <span className="text-[var(--text-secondary)]">·</span>

                    <button
                      onClick={() =>
                        startEditMode(
                          activePrompt,
                          displayedContent,
                          selectedVersionToInspect
                            ? `Nouvelle révision basée sur v${selectedVersionToInspect.version_number}`
                            : 'Nouvelle révision manuelle'
                        )
                      }
                      className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nouvelle révision</span>
                    </button>

                    <span className="text-[var(--text-secondary)]">·</span>

                    <button
                      onClick={() => {
                        setSelectedPromptIdForHistory(activePrompt.id);
                        setActiveView('history');
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] whitespace-nowrap shrink-0"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Ouvrir dans le comparateur plein écran</span>
                    </button>
                  </div>
                </div>

                {isLoadingVersions ? (
                  <div className="p-4 text-xs text-[var(--text-secondary)] flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Chargement des versions...</span>
                  </div>
                ) : promptVersions.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] text-xs text-[var(--text-secondary)]">
                    Aucune version enregistrée pour ce prompt.
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-[220px] overflow-y-auto bg-[var(--bg-surface-secondary)]/40">
                    {promptVersions.map((ver, index) => {
                      const isLatest = index === 0;
                      const isCurrentlyViewed = selectedVersionToInspect
                        ? selectedVersionToInspect.id === ver.id
                        : isLatest;

                      return (
                        <div
                          key={ver.id}
                          onClick={() => {
                            if (isLatest) {
                              setSelectedVersionToInspect(null);
                              setShowVersionCompare(false);
                            } else {
                              setSelectedVersionToInspect(ver);
                            }
                          }}
                          className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isCurrentlyViewed
                              ? 'bg-[var(--bg-surface-secondary)] border-l-2 border-l-[var(--accent-primary)]'
                              : 'hover:bg-[var(--bg-surface-secondary)]/60'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-[var(--text-main)] tabular-nums">
                                v{ver.version_number}
                              </span>
                              {isLatest && (
                                <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
                                  (Actuelle)
                                </span>
                              )}
                              <span aria-hidden="true" className="text-[var(--text-secondary)]">
                                ·
                              </span>
                              <span className="font-medium text-[var(--text-main)]">
                                {ver.change_summary}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                              <Clock className="w-3 h-3" />
                              <span className="font-mono tabular-nums">
                                {new Date(ver.created_at).toLocaleString('fr-FR', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {ver.is_manual_edit
                                  ? 'Édition manuelle'
                                  : `Mode ${ver.mode_used}`}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{ver.model}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {ver.content.split(/\s+/).length} mots
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(ver.content);
                                addToast(
                                  'success',
                                  `Version v${ver.version_number} copiée dans le presse-papiers.`
                                );
                              }}
                              className="px-2 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                            >
                              Copier v{ver.version_number}
                            </button>

                            {!isLatest && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreVersionInLibrary(ver);
                                }}
                                disabled={isRestoringVersion}
                                title={`Restaurer v${ver.version_number} en tant que nouvelle version v${latestVersionNumber + 1}`}
                                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 text-[11px] font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restaurer</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions secondaires : Optimiseur, Convertir en modèle, Export */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      openPromptInOptimizer(displayedContent, activePrompt.title)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Optimiser cette version</span>
                  </button>

                  <button
                    onClick={() => handleConvertToTemplate(activePrompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]"
                  >
                    <BookTemplate className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Réutiliser comme modèle</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--text-secondary)] mr-1 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Exporter ce prompt :
                  </span>
                  <button
                    onClick={() => handleExportSingle(activePrompt, 'json')}
                    className="px-2.5 py-1 rounded border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 text-xs font-mono font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20"
                  >
                    .JSON
                  </button>
                  <button
                    onClick={() => handleExportSingle(activePrompt, 'md')}
                    className="px-2 py-1 rounded border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                  >
                    .MD
                  </button>
                  <button
                    onClick={() => handleExportSingle(activePrompt, 'txt')}
                    className="px-2 py-1 rounded border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                  >
                    .TXT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
