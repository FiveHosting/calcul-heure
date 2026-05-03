# 📋 PROMPT COMPLET - SAAS VÉRIFICATION PAIE RAPIDE

## 🎯 VISION PRODUIT

**Nom produit :** PayCheck (ou Vérifie Ta Paie)

**Tagline :** "Vérifie ta paie en 10 secondes. Comprends tes droits. Agis rapidement."

**Cible :** Employés en CDI/CDD en France qui veulent vérifier que leur paie est conforme à la législation.

**Problème résolu :** Les salariés n'ont pas de moyen simple pour vérifier rapidement si leur paie est correcte sans consulter un avocat ou un syndicat. Risque de sous-paiement non détecté.

**Différenciation :** 
- UX ultra-rapide (verdict en 10 sec)
- Législation France intégrée et à jour
- Pas de jargon juridique lourd
- Action immédiate (message prêt à envoyer)
- Privacy first (données chiffrées, coffre-fort salarié)

---

## 📊 OBJECTIFS MVP (30 jours)

1. Saisir ou importer heures travaillées + fiche de paie
2. Calculer paie théorique selon législation France
3. Détecter écarts et anomalies fréquentes
4. Afficher verdict en score de conformité /100
5. Proposer actions claires et modèle de message
6. Système d'auth simple + workspace utilisateur

---

## 💰 MODÈLE D'ABONNEMENT & FACTURATION

### Plans et Pricing

```
┌─────────────────────────────────────────────────────┐
│  GRATUIT              PRO              BUSINESS      │
│  0€/mois             4,99€/mois       12,99€/mois   │
├─────────────────────────────────────────────────────┤
│ ✅ 1 analyse/mois    ✅ Illimitées     ✅ Illimitées  │
│ ❌ Pas d'export      ✅ Export PDF     ✅ Export +API │
│ ❌ Pas de coffre     ✅ Coffre 1GB     ✅ Coffre 10GB │
│ ❌ Pas d'historique  ✅ 12 mois hist.  ✅ 36 mois     │
│                      ❌ Pas support    ✅ Support     │
│                      ❌ Pas juriste    ✅ Juriste 1x  │
└─────────────────────────────────────────────────────┘
```

### Modèle Business (Futur - Année 2)

**B2B2C : Cabinets juridiques / Syndicats**
- Plan blanc (whitelabel)
- Tarif: 99€/mois + 2€ par utilisateur
- Leurs clients accèdent via URL personnalisée
- Rapports en branding client

**Enterprise**
- Pricing sur demande
- SSO + audit logs + intégration custom
- Support 24/7 + SLA
- Pour RH/Paie/Compta

---

## 🗄️ MODÈLE DE DONNÉES - ABONNEMENT

### Table Subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL, -- 'free', 'pro', 'business'
  status VARCHAR(20) NOT NULL, -- 'active', 'paused', 'cancelled', 'past_due'
  
  -- Stripe integration
  stripe_subscription_id VARCHAR(100) UNIQUE,
  stripe_customer_id VARCHAR(100) UNIQUE,
  
  -- Dates
  started_at TIMESTAMP NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  next_billing_date TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Pricing
  monthly_price DECIMAL(10,2),
  annual_price DECIMAL(10,2),
  billing_cycle VARCHAR(10) NOT NULL, -- 'monthly', 'annual'
  
  -- Promo code
  promo_code_id UUID REFERENCES promo_codes(id),
  discount_amount DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_limits (
  id UUID PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL,
  feature VARCHAR(100) NOT NULL, -- 'analyses_per_month', 'storage_gb', etc.
  limit_value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(100) UNIQUE,
  
  status VARCHAR(20) NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  invoice_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  
  pdf_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  
  feature VARCHAR(100) NOT NULL, -- 'analyses', 'api_calls', 'storage_used_mb'
  usage_count INT NOT NULL,
  
  month_year VARCHAR(7) NOT NULL, -- '2026-04'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature, month_year)
);

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value INT NOT NULL, -- 20 pour 20% ou 500 pour 5€
  
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  max_uses INT,
  current_uses INT DEFAULT 0,
  
  applies_to VARCHAR(20), -- 'all', 'pro', 'business', null = all
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table Pas Oubliée : user_features

```sql
CREATE TABLE user_features (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  
  -- Features unlock (booléens basés sur plan)
  can_export_pdf BOOLEAN DEFAULT FALSE,
  can_access_vault BOOLEAN DEFAULT FALSE,
  can_access_api BOOLEAN DEFAULT FALSE,
  can_contact_juriste BOOLEAN DEFAULT FALSE,
  can_see_analytics BOOLEAN DEFAULT FALSE,
  
  -- Limites (recalculées chaque mois)
  analyses_limit INT,
  analyses_used INT DEFAULT 0,
  storage_limit_gb INT,
  storage_used_mb INT DEFAULT 0,
  api_calls_limit INT,
  api_calls_used INT DEFAULT 0,
  
  vault_documents_limit INT,
  vault_documents_count INT DEFAULT 0,
  
  reset_date DATE, -- Date du prochain reset (tous les mois)
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 INTÉGRATION STRIPE

### Setup Stripe

1. **Créer compte Stripe**
2. **Produits et Prix dans Stripe Dashboard**
   - Produit: "PayCheck Pro Plan"
   - Prix: 4,99€/mois (courant) + 49,90€/an (annuel)
   - Configurer webhooks

3. **Environment Variables**
   ```
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### Flow d'inscription au plan PRO

```
1. Utilisateur clique "Upgrade to PRO"
   ↓
2. Redirect vers /checkout?plan_id=pro
   ↓
3. Page checkout affiche:
   - Résumé plan
   - Stripe payment element (carte)
   - Checkbox "facturation annuelle" (remise 20%)
   ↓
4. Submit formulaire
   ↓
5. Backend: createCheckoutSession() via Stripe API
   - Crée session Stripe
   - Retourne redirect URL
   ↓
6. Frontend: Redirect vers Stripe Checkout
   ↓
7. Utilisateur complète paiement
   ↓
8. Stripe envoie webhook 'checkout.session.completed'
   ↓
9. Backend: process webhook
   - Créer subscription en DB
   - Mettre à jour user.plan_id
   - Envoyer email confirmation
   ↓
10. Utilisateur redirigé vers /dashboard
    Plan activé immédiatement
```

### Webhooks Stripe à écouter

```typescript
// Backend : routes/webhooks.ts

POST /webhooks/stripe {
  'checkout.session.completed'
  → Créer subscription en DB
  → Mettre à jour user_features
  → Email confirmation

  'customer.subscription.updated'
  → Mettre à jour subscription status
  → Si changement de plan: maj user_features

  'customer.subscription.deleted'
  → Status = 'cancelled'
  → Ramener user au plan gratuit
  → Email: "Votre abonnement annulé"

  'invoice.payment_succeeded'
  → Ajouter invoice en DB
  → Status = 'paid'
  → Email facture + PDF

  'invoice.payment_failed'
  → Status = 'uncollectible'
  → Email rappel paiement
  → Alert user dans app

  'charge.refunded'
  → Annuler subscription si applicable
  → Log remboursement
}
```

---

## 🛒 PAGES & COMPOSANTS ABONNEMENT

### Page 1: /pricing

```
┌──────────────────────────────────────────┐
│         PLANS & TARIFICATION              │
├──────────────────────────────────────────┤
│                                          │
│  [GRATUIT]  [PRO ⭐ Popular] [BUSINESS] │
│                                          │
│  Tableau comparatif features             │
│                                          │
│  Boutons:                                │
│  Gratuit: "Démarrer" (pas de paiement)  │
│  Pro: "Upgrade" → /checkout?plan=pro    │
│  Business: "Contacter nous"              │
│                                          │
│  FAQ abonnement (expandable)             │
└──────────────────────────────────────────┘
```

### Page 2: /checkout

```
┌──────────────────────────────────────────┐
│         FINALISER VOTRE ACHAT             │
├──────────────────────────────────────────┤
│  Plan: PRO                               │
│  Montant: 4,99€/mois                     │
│  Renouvellement: 23/05/2026              │
│                                          │
│  ☐ Facturation annuelle (économisez 20%) │
│    Montant: 49,90€/an                    │
│                                          │
│  [Stripe Payment Form ____________]      │
│                                          │
│  Conditions:                             │
│  ☐ J'accepte les CGV                    │
│  ☐ Renouvellement auto compris           │
│                                          │
│  [PAYER 4,99€]      [Annuler]           │
└──────────────────────────────────────────┘
```

### Page 3: /account/billing (Gestion abonnement)

```
┌──────────────────────────────────────────┐
│        MON ABONNEMENT & FACTURATION       │
├──────────────────────────────────────────┤
│  Plan actuel: PRO                        │
│  Status: ✅ Actif                        │
│  Renouvellement: 23/05/2026              │
│                                          │
│  [Changer de plan]  [Annuler]           │
│                                          │
│  Méthode de paiement:                    │
│  Visa ••••4242 exp. 12/27                │
│  [Modifier]                              │
│                                          │
│  ─────────────────────────────────────── │
│  HISTORIQUE FACTURES (6 derniers mois)  │
│                                          │
│  23/04/2026 | PRO | 4,99€ | ✅ Payée   │
│             | [PDF ↓] [Email]           │
│                                          │
│  23/03/2026 | PRO | 4,99€ | ✅ Payée   │
│             | [PDF ↓] [Email]           │
│                                          │
│  23/02/2026 | PRO | 4,99€ | ✅ Payée   │
│             | [PDF ↓] [Email]           │
│                                          │
│  [Télécharger toutes les factures]      │
└──────────────────────────────────────────┘
```

### Page 4: /dashboard (Usage tracker)

```
Pour plan PRO:

┌──────────────────────────────────────────┐
│         MON UTILISATION CE MOIS           │
├──────────────────────────────────────────┤
│  📊 Analyses: 12 / ILLIMITÉES            │
│     [████████░░░░░░░░░░░░] 40%          │
│                                          │
│  💾 Stockage: 250MB / 1GB                │
│     [██░░░░░░░░░░░░░░░░░░░] 25%         │
│                                          │
│  🔌 Appels API: 456 / ILLIMITÉES         │
│     [████████████░░░░░░░░░] 76%         │
│                                          │
│  📄 Documents coffre: 8 / ILLIMITÉES     │
│                                          │
│  Reset: 23/05/2026                      │
│  [Upgrade vers Business si besoin]      │
└──────────────────────────────────────────┘
```

---

## 📊 MIDDLEWARE & GUARDS

### TypeScript: Check Plan Access

```typescript
// middleware/requirePlan.ts
export const requirePlan = (minPlan: 'pro' | 'business') => {
  return async (req: NextRequest) => {
    const subscription = await db.subscriptions.findFirst({
      where: { user_id: req.user.id }
    });

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Plan upgrade required' },
        { status: 402 } // 402 Payment Required
      );
    }

    if (minPlan === 'business' && subscription.plan_id !== 'business') {
      return NextResponse.json(
        { error: 'Business plan required' },
        { status: 403 }
      );
    }
  };
};

// API route protected
app.get('/api/vault', requirePlan('pro'), async (req, res) => {
  // Utilisateur GARANTIT d'avoir au moins plan PRO
});
```

### Limit Usage

```typescript
// services/usageTracking.ts
export const incrementUsage = async (
  userId: string,
  feature: 'analyses' | 'api_calls' | 'storage_mb',
  amount: number
) => {
  const tracking = await db.usage_tracking.upsert({
    where: {
      user_id_feature_month_year: {
        user_id: userId,
        feature,
        month_year: getCurrentMonthYear(),
      }
    },
    update: { usage_count: { increment: amount } },
    create: {
      user_id: userId,
      feature,
      usage_count: amount,
      month_year: getCurrentMonthYear(),
    }
  });

  // Vérifier limite
  const userFeatures = await db.user_features.findFirst({
    where: { user_id: userId }
  });

  if (feature === 'analyses' && 
      tracking.usage_count > userFeatures.analyses_limit) {
    throw new Error('Analyse limit reached for this month');
  }
};
```

---

## 📧 EMAILS À CONFIGURER

1. **Bienvenue Plan Gratuit**
   - Explique fonctionnalités
   - CTA "Upgrade"

2. **Confirmation Paiement**
   - "Merci ! Votre abonnement PRO est actif"
   - Lien facture PDF
   - Lien compte billing

3. **Renouvellement Réussi**
   - "Votre renouvellement a été traité"
   - Facture attachée

4. **Paiement Échoué**
   - "Impossible de renouveler votre paiement"
   - Lien mise à jour méthode paiement
   - Compte limité en 3 jours si non résolu

5. **Rappel Annulation**
   - Si abonnement expire bientôt après annulation
   - "Votre accès se termine le..."
   - CTA réactiver

6. **Facture Disponible**
   - "Téléchargez votre facture en PDF"
   - Lien direct

---

## 🔐 SÉCURITÉ PAIEMENT

- **PCI Compliance**: Jamais stocker numéro carte → Stripe le fait
- **webhooks vérifiés**: Signature Stripe obligatoire
- **Tokens JWT**: Session utilisateur sécurisée
- **HTTPS only**: Toujours
- **Logs**: Pas de données sensibles (numéros/CVV)
- **3D Secure**: Automatique via Stripe

---

## 📈 METRIQUES ABONNEMENT À TRACKER

```typescript
// PostHog / analytics
{
  'subscription_created': { plan: 'pro', cycle: 'monthly' },
  'subscription_upgraded': { from: 'free', to: 'pro' },
  'subscription_cancelled': { plan: 'pro', reason: 'too_expensive' },
  'payment_failed': { plan: 'pro', error: 'card_declined' },
  'free_trial_started': {},
  'usage_limit_reached': { feature: 'analyses', plan: 'free' },
}
```

---

### MODE 1: Calcul Simple (hérité du projet actuel)

**Pour :** Indépendants, freelances, ou simples suivi heures
**Parcours :**
1. Saisir heures travaillées + tarif horaire
2. Voir montant total facturé
3. Historique mois/année
4. Export facture PDF
5. Statistiques temps travaillé

**Écran mobile :** Pointage ultra-rapide (1 clic entrée/sortie)

### MODE 2: Vérification Paie Pro (nouveau)

**Pour :** Salariés CDI/CDD qui vérifient conformité paie
**Parcours :**
1. Uploader fiche de paie
2. Vérifier conformité législation
3. Détecter anomalies
4. Agir (message RH prêt)
5. Suivi corrections

**Écran mobile :** Scan rapide verdict + actions

### Sélection mode
À la première connexion, utilisateur choisit:
- "Je suis indépendant/freelance" → Mode Calcul Simple
- "Je suis salarié" → Mode Vérification Paie

---

## �🏗️ TECH STACK RECOMMANDÉ

**Backend :**
- Node.js 18+ + Express
- PostgreSQL (au lieu de SQLite pour multi-tenant et scalabilité)
- JWT auth + refresh tokens
- Bull pour jobs (calculs paie async)
- TypeScript strict

**Frontend :**
- Next.js 14+ (App Router, TypeScript)
- React 18+ avec TypeScript
- TailwindCSS + shadcn/ui (composants pro)
- React Query / TanStack Query pour requêtes
- Zod pour validation form
- PWA (service worker pour offline mode sur mobile)

**Mobile :**
- Responsive design mobile-first
- PWA installable sur téléphone
- Optimisation sombre (économie batterie)
- Pointage rapide (UX 1 clic)

**Déploiement :**
- Vercel pour Next.js (edge functions)
- Railway ou Fly.io pour backend
- AWS S3 ou MinIO pour docs
- Stripe pour paiement

**DevOps :**
- Docker + docker-compose
- GitHub Actions pour CI/CD
- Sentry pour monitoring erreurs
- PostHog pour analytics produit

---

## ⚙️ INTERFACE DE GESTION (Tout sur le site)

### Dashboard Admin (dans la même app)

**Accès :** Utilisateurs avec rôle admin ou manager

**Sections :**
1. **Équipe**
   - Liste employés
   - Modifier profil
   - Changer rôle (admin/manager/user)
   - Supprimer utilisateur
   - Import/export CSV

2. **Heures & Paie**
   - Vue d'ensemble heures travaillées tous employés
   - Approbation fiches avant paie
   - Générateur paie (export PAIE ou compta)
   - Historique corrections

3. **Documents**
   - Stockage centralisé fiches de paie
   - Backup automatique
   - Gestion conventions collectives

4. **Alertes**
   - Anomalies détectées
   - Heures manquantes (non pointées)
   - Conformité paie par employé

5. **Paramètres**
   - Tarifs horaires entreprise
   - Conventions applicables
   - Jours fériés
   - Pauses obligatoires
   - Export/import données

### Navigation

```
En haut: Logo | Menu Mode | Profile | Déconnexion
Côté: 
  [En tant que Manager/Admin]
  - Dashboard
  - Mes heures (si aussi employé)
  - Équipe
  - Paie
  - Documents
  - Alertes
  - Paramètres
```

---

## 📱 MOBILE-FIRST DESIGN

### Principes

1. **Pointage rapide sur mobile**
   - Bouton "Entrée" / "Sortie" immense
   - 1 tap = action enregistrée + confirmation visuelle
   - Pas de pop-up lourd, UX fluide

2. **PWA (Progressive Web App)**
   - Installable sur écran d'accueil iOS/Android
   - Fonctionne offline (service worker)
   - Push notifications rappel pointage

3. **Responsive breakpoints**
   - Mobile (< 640px) : UX 1 colonne, boutons XXL
   - Tablette (640-1024px) : 2 colonnes, navigation collapsible
   - Desktop (> 1024px) : UI complète, sidebar fixe

4. **Sombre par défaut**
   - Mode sombre économise batterie mobile
   - Meilleure lisibilité soleil
   - Optionnel light mode pour desktop

5. **Optimisation mobile**
   - Images lazy-loaded
   - Bundle JS < 150KB initial (Next.js)
   - Fonts système (pas de CDN lourd)
   - Compression gzip

### Exemples UX Mobile

**Écran Pointage (Mode Calcul Simple)**
```
┌────────────────────────┐
│    09:47               │  (heure actuelle)
├────────────────────────┤
│  📍 Vous êtes "Dehors" │
├────────────────────────┤
│                        │
│   [  ENTRÉE  ]  ← 80px │  (bouton XXL)
│                        │
├────────────────────────┤
│  Dernier pointage:     │
│  ↓ Sortie 17:32       │
│  ↓ Entrée 08:15       │
├────────────────────────┤
│  📊 Aujourd'hui: 8h42m │
│  💰 Facturé: 345€      │
└────────────────────────┘
```

**Écran Verdict (Mode Paie)**
```
┌────────────────────────┐
│  Conformité: 78/100   │
│  ⚠️ À vérifier         │
├────────────────────────┤
│  Vous devez recevoir:  │
│  2 450,50 €            │  ← énorme
│  Vous avez reçu:       │
│  2 380,00 €            │
│  Manquant: -70,50 €    │  ← rouge
├────────────────────────┤
│  🔴 3 ALERTES          │
│  1. Heures sup non     │
│     majorées           │
│  2. Nuit manquante     │
│  3. (voir détail)      │
├────────────────────────┤
│  [AGIR MAINTENANT]     │  ← gros bouton
└────────────────────────┘
```

---

### STRUCTURE UX DÉTAILLÉE - FLUX UTILISATEUR

```
ÉTAPE 1: Profil
- Secteur d'activité (dropdown)
- Convention collective (autocomplete)
- Type contrat (CDI/CDD/Stage)
- Horaire (35h, 39h, horaire spécial)

ÉTAPE 2: Données actuelles
- Heures travaillées ce mois (input numérique)
- Heures sup à 25% / 50% (input)
- Primes / bonus (textarea)

ÉTAPE 3: Fiche de paie
- Upload PDF fiche
- Ou saisie manuelle salaire brut/net
```

### Écran 2: Résultat Verdict (le cœur du produit)

```
┌─────────────────────────────────────────┐
│  SCORE CONFORMITÉ: 78/100  ⚠️ A vérifier │
├─────────────────────────────────────────┤
│                                         │
│  Salaire théorique:  2 450,50 €         │
│  Salaire reçu:      2 380,00 €         │
│  Écart détecté:      - 70,50 €         │
│  Confiance calcul:   MOYENNE (donnees  │
│                      incomplètes)       │
├─────────────────────────────────────────┤
│  🔴 ALERTES (3)                         │
│  1. Heures sup 25% non majorées (+45€)  │
│  2. Majoration nuit manquante (+18€)    │
│  3. Avantage nature non décompté (-)    │
├─────────────────────────────────────────┤
│  ✅ CONFORMES                           │
│  - SMIC horaire respecté                │
│  - Cotisations sociales OK              │
│  - Jours fériés payés                   │
├─────────────────────────────────────────┤
│  [Détail des calculs ▼]  [Agir maintenant] │
└─────────────────────────────────────────┘
```

### Écran 3: Actions Proposées

```
CHECKLIST IMMÉDIATE:
☐ Demande amiable par message (copie prête)
☐ Télécharger lettre recommandée modèle
☐ Historique des écarts (derniers mois)
☐ Sauvegarder ce rapport (PDF)
☐ Consulter juriste partenaire
```

---

## 🔐 MODÈLE DE DONNÉES

### Utilisateur
```sql
- id
- email
- password (hashée)
- nom_complet
- workspace_id
- secteur_activite
- convention_collective
- type_contrat (CDI/CDD)
- horaire_hebdo (35/39/autre)
- date_creation
- chiffrement_cle (salt personnalisé)
```

### Fiche de Paie
```sql
- id
- user_id
- date_periode_debut
- date_periode_fin
- salaire_brut
- salaire_net
- heures_travaillees
- heures_sup_25
- heures_sup_50
- heures_nuit
- heures_dimanche
- primes_diverses
- cotisations_totales
- document_pdf (URL S3)
- date_upload
- confiance_extraction (0-100)
```

### Calcul & Verdict
```sql
- id
- fiche_paie_id
- salaire_theorique_calcule
- salaire_recu
- ecart_euros
- score_conformite (0-100)
- alertes (JSON array)
- conformites (JSON array)
- actions_proposees (JSON)
- date_calcul
```

### Document Utilisateur (coffre-fort)
```sql
- id
- user_id
- type (fiche_paie/contrat/bulletin/autre)
- nom_fichier
- url_s3_chiffree
- date_upload
- tag_periode
```

---

## 🎨 COMPOSANTS UI CLÉS

### Badge Score Conformité
- 80-100: ✅ Vert "Conforme"
- 60-79: ⚠️ Orange "À vérifier"
- 0-59: 🔴 Rouge "Risque élevé"

### Alert Cards (3 designs)
1. **Anomalie** (rouge) : Données aberrantes
2. **Attention** (orange) : Vérification manuelle recommandée
3. **Info** (bleu) : Information utile

### Modales
- Détail légal d'une alerte (1 clic, simple explication)
- Générateur message RH (copie 1 clic)
- Upload fiche PDF avec OCR preview

---

## ⚖️ MOTEUR DE CALCUL PAIE (Logique clé)

### Données d'entrée
```javascript
{
  heures_travaillees: 160,           // mois entier
  heures_sup_25: 5,                  // majorées 25%
  heures_sup_50: 2,                  // majorées 50%
  heures_nuit: 8,                    // majorées 10-20%
  heures_dimanche: 4,                // majorées 100%
  salaire_horaire: 11.27,            // SMIC ou négocié
  primes: [100, 50],                 // bonus divers
  convention: "CCNI_Bâtiment",       // détermine règles
  type_contrat: "CDI",
}
```

### Calcul salaire théorique
```
Brut = (heures_normales × smic) 
     + (heures_sup_25 × smic × 1.25)
     + (heures_sup_50 × smic × 1.50)
     + (heures_nuit × smic × 1.10)
     + (heures_dimanche × smic × 2.00)
     + primes

Net ≈ Brut × 0.78 (approx après cotisations)
```

### Alertes à détecter (TOP 10)
1. ❌ Heures sup non majorées
2. ❌ Repos hebdo ou jours fériés non respectés
3. ❌ Majoration nuit manquante
4. ❌ Majoration dimanche manquante
5. ⚠️ SMIC non respecté
6. ⚠️ Cotisations anormales
7. ⚠️ Indemnité rupture erronée
8. ⚠️ Congés payés mal calculés
9. ℹ️ Avantage nature à déclarer
10. ℹ️ Mutuelle déduite correctement

### Score conformité calcul
```
score = 100
- (ecart_en_euros / salaire_brut * 100)  // pondération écart
- (nombre_alertes * 5)                    // chaque alerte -5
+ (confiance_donnees * 10)                // si données complètes +10
```

---

## 📋 FEATURES PRIORITÉ 1 (MVP - Semaines 1-2)

### Mode Calcul Simple
- [x] Pointage entrée/sortie (desktop + mobile)
- [x] Calcul automatique heures/salaire
- [x] Historique journalier + mensuel
- [x] Export PDF facture
- [x] Stats simples (heures/montant)

### Mode Paie
- [x] Auth inscription/login TypeScript
- [x] Sélection mode (Simple ou Paie)
- [x] Onboarding 3 étapes
- [x] Saisie heures + fiche paie
- [x] Calcul brut/net basique + alertes 3 principales
- [x] Affichage verdict + score

### Transversal
- [x] Responsive mobile-first
- [x] PWA installable
- [x] Dashboard utilisateur
- [x] Workspace utilisateur
- [x] Gestion admin sur le site (rôles)

---

## 📋 FEATURES PRIORITÉ 2 (Semaines 3-4)

### Mode Calcul Simple
- [ ] Gestion équipe (manager voir heures employés)
- [ ] Approbation fiches heures
- [ ] Rappels push pointage
- [ ] Intégration compta (export sage/paie)

### Mode Paie
- [ ] Upload PDF fiche paie + OCR extraction
- [ ] Cofre-fort documents (chiffré)
- [ ] Historique 6 derniers mois + graphique écarts
- [ ] Explications légales (1 ligne par alerte)
- [ ] Formulaire contact juriste partenaire

### Admin (pour les deux modes)
- [ ] Analytics produit basiques (PostHog)
- [ ] Gestion utilisateurs avancée
- [ ] Logs audit
- [ ] Backups auto

---

## 🔐 SÉCURITÉ & CONFORMITÉ

1. **Auth :**
   - JWT + refresh tokens
   - 2FA optionnel
   - Sessions timeout 30 min

2. **Données :**
   - HTTPS only
   - Chiffrement bout-à-bout pour documents
   - Pas de logs de données sensibles
   - Suppression données 30j après demande

3. **RGPD :**
   - Consentements affichés
   - Droit à l'oubli
   - Export données utilisateur

4. **Légal :**
   - Disclaimer juridique (pas conseil juridique)
   - Mentions CGU claires
   - Responsabilité limitée
   - Partenariat avec juriste pour validations

---

## 💰 MODÈLE PRICING (Futur)

```
GRATUIT
- 1 analyse par mois
- Pas d'export PDF
- Pas d'accès coffre-fort

PRO (4,99€/mois)
- Analyses illimitées
- Export PDF + historique 12 mois
- Coffre-fort documents 1GB
- Priorité support

PREMIUM (9,99€/mois)
- Tout PRO +
- Consultation juriste 1/mois
- Alertes anomalies par email
- Suivi corrections RH
```

---

## 🗂️ STRUCTURE REPO (Next.js + TypeScript)

```
paycheck-app/
├── frontend/ (Next.js 14 TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── pointage/page.tsx (Mode Simple)
│   │   │   │   ├── verdict/page.tsx (Mode Paie)
│   │   │   │   ├── team/page.tsx (Admin)
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── api/ (API Routes)
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── pointage/route.ts
│   │   │   │   ├── paie/route.ts
│   │   │   │   ├── team/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   └── layout.tsx (global)
│   │   ├── components/
│   │   │   ├── Pointage/
│   │   │   │   ├── PointageButton.tsx
│   │   │   │   ├── PointageHistory.tsx
│   │   │   │   └── PointageStats.tsx
│   │   │   ├── Paie/
│   │   │   │   ├── VerdictCard.tsx
│   │   │   │   ├── AlertCard.tsx
│   │   │   │   └── ActionPanel.tsx
│   │   │   ├── Admin/
│   │   │   │   ├── TeamTable.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   └── DashboardStats.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Layout/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── api.ts (API client)
│   │   │   ├── types.ts (TypeScript interfaces)
│   │   │   ├── validators.ts (Zod schemas)
│   │   │   ├── auth.ts (NextAuth config)
│   │   │   └── utils.ts (helpers)
│   │   ├── hooks/
│   │   │   ├── usePointage.ts
│   │   │   ├── usePaie.ts
│   │   │   ├── useTeam.ts
│   │   │   └── useAuth.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ModeContext.tsx (Simple vs Paie)
│   │   ├── styles/
│   │   │   ├── globals.css (Tailwind)
│   │   │   ├── mobile.css
│   │   │   └── dark.css
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   └── manifest.json (PWA)
│   │   └── middleware.ts (auth, route protection)
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── .env.example
│   ├── .env.local (git ignored)
│   └── package.json
│
├── backend/ (Node.js Express + TypeScript)
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── pointage.ts
│   │   │   ├── paie.ts (calculs)
│   │   │   ├── team.ts (admin)
│   │   │   └── upload.ts (PDF/OCR)
│   │   ├── services/
│   │   │   ├── paie.service.ts (moteur calcul)
│   │   │   ├── ocr.service.ts (extraction PDF)
│   │   │   ├── encryption.service.ts
│   │   │   └── email.service.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Pointage.ts
│   │   │   ├── FichePaie.ts
│   │   │   └── Alert.ts
│   │   ├── validators/
│   │   │   ├── pointage.validator.ts
│   │   │   └── paie.validator.ts
│   │   ├── types/
│   │   │   └── index.ts (shared TypeScript types)
│   │   └── jobs/ (Bull queues)
│   │       └── paieCalculation.ts
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── docker-compose.yml
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── shared/ (Types TypeScript partagés)
│   ├── types/
│   │   ├── user.ts
│   │   ├── pointage.ts
│   │   ├── paie.ts
│   │   └── index.ts
│   └── validators/
│       └── index.ts
│
├── docs/
│   ├── API.md
│   ├── CALCUL_PAIE.md
│   ├── LEGISL_FR.md
│   ├── DEPLOYMENT.md
│   ├── TYPESCRIPT_GUIDE.md
│   └── MOBILE_PWA.md
│
├── docker-compose.yml (root)
├── README.md
├── CONTRIBUTING.md
└── PROMPT_NOUVEAU_PROJET.md
```

---

## 🚀 COMMANDES DÉMARRAGE (Next.js + TypeScript)

```bash
# Clone et setup
git clone https://github.com/ton-user/paycheck-app.git
cd paycheck-app

# Backend (Node.js + Express + TypeScript)
cd backend
npm install
cp .env.example .env
# Éditer .env avec DB_URL, JWT_SECRET, etc.
docker-compose up -d postgres redis
npm run migrate
npm run seed
npm run dev # http://localhost:5000

# Frontend (Next.js 14 + TypeScript)
# (autre terminal)
cd frontend
npm install
cp .env.example .env.local
# Éditer .env.local avec NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev # http://localhost:3000

# Tests
npm run test
npm run type-check # Vérifier TypeScript

# Build prod
npm run build
npm run start
```

### Variables d'environnement essentielles

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/paycheck
JWT_SECRET=super-secret-key-change-in-prod
NEXTAUTH_SECRET=another-secret-key
REDIS_URL=redis://localhost:6379
OCR_API_KEY=xxx (si Tesseract cloud)
S3_BUCKET=paycheck-docs
S3_REGION=eu-west-1
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-secret-key
```

---

## ✅ CHECKLIST AVANT PRODUCTION

- [ ] Tests unitaires auth + calculs paie (80%+ couverture)
- [ ] Tests intégration E2E onboarding complet
- [ ] Audit sécu (OWASP Top 10)
- [ ] Validations données exhaustives
- [ ] Sauvegardes auto DB
- [ ] Monitoring erreurs (Sentry)
- [ ] Logs audit actions critiques
- [ ] CGU + politique confidentialité relues juriste
- [ ] Performance (< 2sec verdict)
- [ ] Responsive mobile + tablet

---

## 📚 RESSOURCES LÉGISLATION À INTÉGRER

```json
{
  "sources_priorite": [
    "Code du travail France 2024",
    "SMIC horaire actualisé",
    "Conventions collectives par secteur",
    "Durée légale travail (35h)",
    "Heures supplémentaires règles",
    "Congés payés calcul",
    "Repos obligatoires",
    "Majoration nuit/dimanche"
  ],
  "version_control": "v2024.Q2",
  "revision_cycle": "Trimestriel"
}
```

---

## 🔷 SPÉCIFICATIONS TypeScript

### Principes

1. **Strict mode activé** (`tsconfig.json`)
   ```json
   {
     "strict": true,
     "noImplicitAny": true,
     "strictNullChecks": true,
     "strictFunctionTypes": true
   }
   ```

2. **Types partagés** (`shared/types/`)
   - Les types utilisateur, pointage, paie sont dans un dossier partagé
   - Importés dans backend ET frontend
   - Single source of truth

3. **Zod pour validation**
   ```typescript
   const PointageSchema = z.object({
     userId: z.string().uuid(),
     type: z.enum(['entree', 'sortie']),
     timestamp: z.date(),
   });
   
   type Pointage = z.infer<typeof PointageSchema>;
   ```

4. **API Responses typées**
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
     code?: number;
   }
   ```

5. **React components avec TypeScript**
   ```typescript
   interface PointageButtonProps {
     onPointage: (type: 'entree' | 'sortie') => void;
     isLoading?: boolean;
   }
   
   export const PointageButton: React.FC<PointageButtonProps> = (props) => {
     // ...
   };
   ```

---

## 📋 WORDING CLÉS (Ultra simple pour utilisateurs)

| Terme technique | Wording utilisateur |
|---|---|
| Majoration | "Bonus heures" |
| Cotisations sociales | "Prélèvement (impôts, sécu)" |
| Avantage nature | "Avantage (logement, voiture, etc.)" |
| Indemnité | "Compensation" |
| Convention collective | "Règles de ton secteur" |
| SMIC | "Salaire minimum légal" |

---

## 🔄 MIGRATION DEPUIS PROJET ACTUEL

### Données à porter

Si tu migres depuis le projet "calcul-heure" actuel:

1. **Utilisateurs** → Migration table users
2. **Pointages** → Migration table pointages (ancien "work_entries")
3. **Heures** → Compatible directe, juste renommer colonnes
4. **Configurations** → Mettre à jour routes Next.js

### Script migration SQL

```sql
-- Renommer/adapter les tables
ALTER TABLE work_entries RENAME TO pointages;
ALTER TABLE pointages RENAME COLUMN start_time TO heure_entree;
ALTER TABLE pointages RENAME COLUMN end_time TO heure_sortie;
ALTER TABLE pointages RENAME COLUMN total_hours TO total_heures;

-- Ajouter colonne mode (null pour ancien, 'simple' pour nouveau)
ALTER TABLE users ADD COLUMN mode VARCHAR(10) DEFAULT 'simple';
```

### Adaptation des routes

- Ancien `/api/entries` → Nouveau `/api/pointage` (Mode Simple)
- Nouveau `/api/paie/*` (Mode Paie)
- Les deux coexistent et utilisent même DB mais structures légèrement différentes

---

## 📱 PWA CONFIGURATION

### manifest.json

```json
{
  "name": "PayCheck - Vérification Paie",
  "short_name": "PayCheck",
  "description": "Vérifie ta paie en 10 secondes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Next.js)

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('paycheck-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/pointage',
        '/verdict',
      ]);
    })
  );
});
```

---

## 🔄 FEUILLE DE ROUTE 90 JOURS

**Mois 1:** MVP Mode Simple + Mode Paie basique
- Semaines 1-2: Setup Next.js + Backend TypeScript
- Semaines 3-4: Pointage + Verdict MVP

**Mois 2:** Features priorité 2 + admin
- Gestion équipe
- OCR PDF
- Admin panel
- PWA optimisation

**Mois 3:** Sécurité + Monétisation
- 2FA optionnel
- Stripe intégration
- 1000 utilisateurs actifs
- Monitoring production

---

**Version:** 2.0 TypeScript + Next.js  
**Date:** Avril 2026  
**Statut:** Prêt pour développement
