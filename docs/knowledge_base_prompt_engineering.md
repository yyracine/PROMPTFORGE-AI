# Méthode pour écrire des prompts professionnels

Voici une méthode structurée en 3 parties : **le cadre**, **les techniques avancées**, et **une checklist** pour tout ce que vous produirez ensuite.

---

## 1. Le cadre : la structure **C-T-C-D** (Contexte – Tâche – Contraintes – Données)

Le meilleur prompt professionnel n'est jamais une phrase floue. Il répond à **4 questions implicites** que l'IA doit pouvoir répondre sans deviner.

### A — Contexte (Qui suis-je, pourquoi cette demande ?)
Donner le contexte réduit le taux d'hallucination de 50 à 70 %. Exemples concrets :
- « Je suis stagiaire en informatique en Côte d'Ivoire, à Abidjan, je prépare une soutenance PFE »
- « Je suis chef de produit dans une startup SaaS B2B de 40 personnes »
- « Je prépare une conférence TED de 12 minutes pour des ingénieurs »

### B — Tâche (Que dois-je produire exactement ?)
Verbe d'action + objet + format de sortie. À éviter :
- ❌ « Parles-moi de la chaîne de valeur »
- ✅ « Rédige une analyse de chaîne de valeur **en 5 bullet points, sous forme de tableau Excel** pour le projet X »

### C — Contraintes (Ce que je ne veux PAS)
Le plus puissant des leviers. Précisez :
- **Longueur** : « maximum 400 mots », « 5 slides », « 1 page »
- **Ton** : « professionnel formel », « accessible grand public », « ton technique »
- **Format** : « JSON », « Markdown », « liste numérotée », « tableau 5 colonnes »
- **À exclure** : « sans jargon technique », « ne mentionne pas le concurrent Y », « pas de phrases d'ouverture type “Voici ce que vous demandiez” »

### D — Données (Les éléments factuels sur lesquels je raisonne)
Plus les données sont structurées et complètes, moins l'IA invente. À fournir :
- Fichiers joints (CSV, PDF, image)
- Chiffres clés (« CA 2025 = 6,6 Md FCFA, 994 clients, 5 villes »)
- Références à citer (« selon le rapport du BICE 2024 »)

---

## 2. Les 7 techniques avancées

### ① Rôlisage (Role Prompting)
« Tu es un consultant en supply chain, 15 ans d'expérience Afrique de l'Ouest, spécialiste des circuits courts. » — Change radicalement le niveau de réponse.

### ② Raisonnement en chaîne (Chain of Thought)
Ajoutez : **« Réfléchis étape par étape avant de répondre. »** ou **« Détaille ton raisonnement, puis présente ta conclusion en un paragraphe final. »** — Améliore la qualité sur les problèmes logiques et de business.

### ③ Exemples (Few-Shot)
Montrez 1 ou 2 exemples de ce que vous voulez, puis demandez de continuer. Beaucoup plus efficace qu'une longue explication.

### ④ Sortie structurée (Structured Output)
« Réponds en JSON avec ces clés : `{"resume": ..., "risques": [...], "actions": [...]}` » — Indispensable pour l'automatisation.

### ⑤ Auto-évaluation (Self-Reflection)
« Après ta réponse, ajoute une section **Vérification** : ce que tu n'as pas pu garantir et ce qu'il faut valider avant utilisation. » — Réduit les erreurs silencieuses.

### ⑥ Méta-système (Système caché)
« Avant de répondre, vérifie : (1) le prompt est-il ambigu ? (2) ai-je assez d'info ? Si oui, questionne-moi ; sinon réponds. » — Vous obtenez une IA plus prudente.

### ⑦ Itération (Prompt Chaining)
Ne faites jamais tout d'un coup. Séquencez :
1. Prompt 1 : « Génère-moi un outline » → vous validez
2. Prompt 2 : « Étends la section 3 avec des chiffres » → vous validez
3. Prompt 3 : « Réécris le tout en ton exécutif »

---

## 3. La checklist rapide (avant d'envoyer votre prompt)

| # | Vérification | Oui / Non |
|:--|:--|:--:|
| 1 | Ai-je donné un **contexte** (qui, pourquoi, où) ? | ☐ |
| 2 | Ma **tâche** est-elle un verbe + objet + format ? | ☐ |
| 3 | Ai-je précisé les **contraintes** (longueur, ton, à éviter) ? | ☐ |
| 4 | Ai-je fourni les **données / fichiers** nécessaires ? | ☐ |
| 5 | Le format de sortie est-il **exemplifié** (ex. : un JSON, un tableau) ? | ☐ |
| 6 | Puis-je **itérer** la tâche plutôt qu'attendre la perfection ? | ☐ |

---

## 4. Le modèle de référence : P-R-I-E-F-V (Contrat d'Ingénierie)

```
[P · PERSONA]     → Rôle + niveau d'expérience + ancrage géographique + audience ciblée
[R · BUT/RÔLE]    → Objectif mesurable et action concrète attendue en sortie
[I · INSTRUCTIONS]→ Sous-blocs stricts : Ton / Structure / Interdits formels / SEO / Longueur
[E · EXEMPLES]    → 1 bon exemple + 1 anti-exemple formel + Faits obligatoires contractuels (règle [?])
[F · FORMAT]      → Livrable pré-fonctionnel (Markdown, JSON-LD, FAQ, Meta title/desc, CTA)
[V · VÉRIFICATION]→ Checklist d'auto-évaluation cochée par l'IA avant livraison
```

### Le dosage B2B optimal (Surprise 20% / Cohérence 80%) :
- **Surprise cadrée (20%)** : Un chiffre-choc terrain dans l'accroche (ligne 1) + une question décisionnelle tranchante dans la chute.
- **Cohérence totale (80%)** : Tout le corps est prévisible, structuré en constats chiffrés, preuves et conseils actionnables sans rupture logique.
- **Règle d'or anti-hallucination** : Tout chiffre ou fait non présent dans les données sources doit être marqué explicitement `[?]`.
