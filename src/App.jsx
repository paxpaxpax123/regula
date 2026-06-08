import React, { useState, useEffect, useMemo, useRef } from 'react';

/* =======================================================================
   REGULA v3 — Reprendre le contrôle : foi, corps, esprit, maîtrise.
   Quatre piliers personnalisables. Un blason qui s'allume. Un rang qui monte.
   Bilan vitalité. Examen du soir. Tes données t'appartiennent.
   ======================================================================= */

const STORAGE_KEY = 'regula-v3';

/* ============== DONNÉES STATIQUES ============== */

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const DAY_NAMES_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// Piliers par défaut — l'utilisateur peut tout éditer dans Réglages
const DEFAULT_PILLARS = [
  { key: 'priere', label: 'Prière', sub: 'je me suis tenu devant Dieu', icon: 'priere' },
  { key: 'sport', label: 'Sport', sub: 'j\u2019ai entraîné mon corps', icon: 'sport' },
  { key: 'nutrition', label: 'Nutrition', sub: 'j\u2019ai mangé avec mesure', icon: 'nutrition' },
  { key: 'controle', label: 'Contrôle', sub: 'j\u2019ai tenu face aux compulsions', icon: 'controle' },
];

const RANKS = [
  { name: 'Postulant', threshold: 0 },
  { name: 'Novice', threshold: 20 },
  { name: 'Écuyer', threshold: 80 },
  { name: 'Chevalier', threshold: 200 },
  { name: 'Miles Christi', threshold: 450 },
  { name: 'Gardien', threshold: 900 },
  { name: 'Preux', threshold: 1500 },
];

const LITURGY = {
  '01-01': { saint: 'Sainte Marie, Mère de Dieu', quote: 'Qu\u2019il me soit fait selon ta parole.', author: 'Lc 1, 38' },
  '01-28': { saint: 'Saint Thomas d\u2019Aquin', quote: 'Je ne veux rien d\u2019autre, Seigneur, que Toi-même.', author: 'Thomas d\u2019Aquin' },
  '03-19': { saint: 'Saint Joseph', quote: 'Ite ad Joseph — Allez à Joseph.', author: 'Gn 41, 55' },
  '03-25': { saint: 'Annonciation', quote: 'Le Verbe s\u2019est fait chair.', author: 'Jn 1, 14' },
  '04-23': { saint: 'Saint Georges, martyr', quote: 'Le courage n\u2019est pas l\u2019absence de peur, mais la victoire sur elle.', author: 'attribué' },
  '04-29': { saint: 'Sainte Catherine de Sienne', quote: 'Soyez qui vous êtes, et vous mettrez le monde en feu.', author: 'Catherine de Sienne' },
  '07-11': { saint: 'Saint Benoît', quote: 'Ora et labora — Prie et travaille.', author: 'Règle de saint Benoît' },
  '07-31': { saint: 'Saint Ignace de Loyola', quote: 'Ad maiorem Dei gloriam.', author: 'Ignace de Loyola' },
  '08-04': { saint: 'Saint Jean-Marie Vianney', quote: 'La prière, c\u2019est l\u2019avant-goût du ciel.', author: 'Curé d\u2019Ars' },
  '08-15': { saint: 'Assomption de la Vierge Marie', quote: 'Mon âme exalte le Seigneur.', author: 'Magnificat' },
  '09-29': { saint: 'Saint Michel Archange', quote: 'Qui est comme Dieu ?', author: 'Mi-ka-El' },
  '10-04': { saint: 'Saint François d\u2019Assise', quote: 'Seigneur, fais de moi un instrument de ta paix.', author: 'François d\u2019Assise' },
  '10-15': { saint: 'Sainte Thérèse d\u2019Avila', quote: 'Nada te turbe — Que rien ne te trouble.', author: 'Thérèse d\u2019Avila' },
  '10-22': { saint: 'Saint Jean-Paul II', quote: 'N\u2019ayez pas peur.', author: 'Jean-Paul II' },
  '11-01': { saint: 'Toussaint', quote: 'Heureux les cœurs purs : ils verront Dieu.', author: 'Mt 5, 8' },
  '12-08': { saint: 'Immaculée Conception', quote: 'Je suis la servante du Seigneur.', author: 'Lc 1, 38' },
  '12-14': { saint: 'Saint Jean de la Croix', quote: 'Au soir de la vie, nous serons jugés sur l\u2019amour.', author: 'Jean de la Croix' },
  '12-25': { saint: 'Nativité du Seigneur', quote: 'Et le Verbe s\u2019est fait chair.', author: 'Jn 1, 14' },
};

const DAILY_QUOTES = [
  { quote: 'Cherchez d\u2019abord le Royaume de Dieu.', author: 'Mt 6, 33' },
  { quote: 'Je puis tout en celui qui me fortifie.', author: 'Ph 4, 13' },
  { quote: 'Hors de moi, vous ne pouvez rien faire.', author: 'Jn 15, 5' },
  { quote: 'Veillez et priez, pour ne pas entrer en tentation.', author: 'Mt 26, 41' },
  { quote: 'L\u2019esprit est ardent, mais la chair est faible.', author: 'Mt 26, 41' },
  { quote: 'Tout est grâce.', author: 'Ste Thérèse de Lisieux' },
  { quote: 'Ma vocation, c\u2019est l\u2019amour.', author: 'Ste Thérèse de Lisieux' },
  { quote: 'Verso l\u2019alto — Vers les sommets.', author: 'Bhx Pier Giorgio Frassati' },
  { quote: 'Notre cœur est sans repos tant qu\u2019il ne repose en Toi.', author: 'Augustin' },
  { quote: 'Rien par force, tout par amour.', author: 'St François de Sales' },
  { quote: 'Servir Dieu, c\u2019est régner.', author: 'Prière du missel' },
  { quote: 'Faites tout pour la gloire de Dieu.', author: '1 Co 10, 31' },
  { quote: 'Veille sur ton cœur : de lui jaillit la vie.', author: 'Pr 4, 23' },
  { quote: 'Il faut que Lui grandisse et que je diminue.', author: 'Jn 3, 30' },
  { quote: 'Sois sobre, veille : ton adversaire rôde.', author: '1 P 5, 8' },
  { quote: 'Combats le bon combat de la foi.', author: '1 Tm 6, 12' },
  { quote: 'Que vos reins soient ceints et vos lampes allumées.', author: 'Lc 12, 35' },
];

// Facteurs de vitalité (inspiration Testo Buffalo, recadré science)
const VITALITY = [
  { key: 'sommeil', label: 'Sommeil', q: 'As-tu dormi 7h+ ?' },
  { key: 'soleil', label: 'Lumière', q: 'Lumière du jour le matin ?' },
  { key: 'force', label: 'Force', q: 'Effort intense aujourd\u2019hui ?' },
  { key: 'jeune', label: 'Sobriété', q: 'Pas de sucre / alcool en excès ?' },
];

/* ============== HELPERS ============== */

const pad = (n) => String(n).padStart(2, '0');
const toISODate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatLongDate = (d = new Date()) => `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
const keyMMDD = (d = new Date()) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const haptic = (ms = 12) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} };

const getLiturgy = (d = new Date()) => {
  const k = keyMMDD(d);
  if (LITURGY[k]) return LITURGY[k];
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const q = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  return { saint: 'Férie du temps ordinaire', quote: q.quote, author: q.author };
};

const startOfWeek = (d = new Date()) => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const day = out.getDay();
  out.setDate(out.getDate() + (day === 0 ? -6 : 1 - day));
  return out;
};
const daysOfWeek = (d = new Date()) => {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    return dd;
  });
};

const totalPoints = (tasks, pillars) => {
  let total = 0;
  Object.values(tasks || {}).forEach((day) => {
    pillars.forEach((p) => { if (day[p.key]) total++; });
  });
  return total;
};
const currentRank = (points) => {
  let r = RANKS[0], next = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].threshold) { r = RANKS[i]; next = RANKS[i + 1] || null; }
  }
  return { current: r, next };
};

// Jours nets consécutifs pour le pilier contrôle (compteur d'abstinence motivant)
const cleanStreak = (tasks, controlKey) => {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const k = toISODate(d);
    const day = tasks[k];
    if (day && day[controlKey]) streak++;
    else if (i === 0) { /* aujourd'hui pas encore coché, on continue */ }
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

/* ============== STORAGE ============== */

const defaultState = () => ({
  tasks: {},
  checkins: {},
  vitality: {},
  pillars: DEFAULT_PILLARS,
  onboarded: false,
  version: 3,
});

const load = () => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed, pillars: parsed.pillars || DEFAULT_PILLARS };
  } catch { return defaultState(); }
};
const saveLS = (s) => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} };

/* ============== STYLES ============== */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #120D07; --bg-2: #1E1610; --bg-3: #2A1F17;
  --gold: #D4A84A; --gold-dim: #6B542A; --gold-deep: #8B6E30;
  --cream: #F2E9D7; --cream-dim: #C4B9A0;
  --muted: #7E7360; --muted-2: #54483A;
  --line: #2F2418; --line-2: #453422;
  --red: #9B3232; --red-deep: #6B1E1E;
  --green: #5E7444;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; background: var(--bg); }
body {
  font-family: 'DM Sans', -apple-system, sans-serif;
  background: var(--bg); color: var(--cream);
  font-size: 16px; line-height: 1.5;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}
.app {
  min-height: 100vh; max-width: 520px; margin: 0 auto;
  padding: 0 0 92px 0; position: relative;
  background: radial-gradient(ellipse at top, rgba(212,168,74,.04), transparent 55%), var(--bg);
}

/* Header */
.header { padding: 22px 22px 14px; text-align: center; }
.h-date { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); letter-spacing: .18em; }
.h-saint { font-family: 'Fraunces', serif; font-size: 17px; color: var(--cream-dim); margin-top: 6px; letter-spacing: .02em; }

/* Badge */
.badge-wrap { display: flex; flex-direction: column; align-items: center; padding: 6px 0 2px; position: relative; }
.badge-count { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; }
.badge-count-num { font-family: 'Fraunces', serif; font-weight: 300; font-size: 42px; color: var(--cream); line-height: 1; }
.badge-count-total { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); margin-top: 4px; letter-spacing: .1em; }

/* Rank */
.rank-block { text-align: center; padding: 14px 22px 4px; }
.rank-name { font-family: 'Fraunces', serif; font-size: 24px; color: var(--gold); letter-spacing: .04em; }
.rank-sub { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); margin-top: 3px; letter-spacing: .05em; }
.rank-bar { margin: 12px auto 0; max-width: 260px; height: 2px; background: var(--line); border-radius: 1px; overflow: hidden; }
.rank-bar-fill { height: 100%; background: linear-gradient(to right, var(--gold-dim), var(--gold)); transition: width .6s cubic-bezier(.3,1.2,.6,1); }
.rank-bar-meta { margin-top: 8px; font-size: 11px; color: var(--muted); letter-spacing: .1em; font-variant-numeric: tabular-nums; }

/* Quote */
.quote-card { margin: 20px 22px 22px; padding: 18px 22px; background: linear-gradient(180deg, rgba(212,168,74,.04), transparent), var(--bg-2); border: 1px solid var(--line); border-left: 2px solid var(--gold-deep); border-radius: 1px; }
.quote-text { font-family: 'Fraunces', serif; font-style: italic; font-size: 16px; line-height: 1.45; color: var(--cream); }
.quote-author { margin-top: 8px; font-size: 11px; color: var(--muted); letter-spacing: .14em; text-transform: uppercase; font-weight: 500; }

/* Pillars */
.pillar-grid { padding: 0 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pillar { padding: 18px 16px 16px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; user-select: none; transition: all .2s ease; position: relative; min-height: 112px; display: flex; flex-direction: column; justify-content: space-between; }
.pillar:active { transform: scale(.97); }
.pillar.done { background: linear-gradient(165deg, rgba(212,168,74,.16), rgba(212,168,74,.05)); border-color: var(--gold-deep); }
.pillar.done::after { content: ''; position: absolute; top: 14px; right: 14px; width: 10px; height: 10px; background: var(--gold); border-radius: 50%; box-shadow: 0 0 10px rgba(212,168,74,.6); animation: pop .35s ease; }
@keyframes pop { 0% { transform: scale(0); } 60% { transform: scale(1.4); } 100% { transform: scale(1); } }
.pillar-icon { width: 26px; height: 26px; margin-bottom: 10px; color: var(--muted); transition: color .25s; }
.pillar.done .pillar-icon { color: var(--gold); }
.pillar-label { font-family: 'Fraunces', serif; font-size: 19px; color: var(--cream-dim); }
.pillar.done .pillar-label { color: var(--cream); }
.pillar-sub { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); line-height: 1.35; margin-top: 5px; }
.pillar-streak { position: absolute; top: 13px; right: 13px; font-family: 'Fraunces', serif; font-size: 12px; color: var(--gold-dim); letter-spacing: .04em; }
.pillar.done .pillar-streak { display: none; }

/* Quick actions */
.quick-actions { padding: 22px 22px 0; display: flex; flex-direction: column; gap: 8px; }
.qa-row { display: flex; gap: 8px; }
.qa-btn { flex: 1; padding: 13px 14px; background: transparent; border: 1px solid var(--line-2); border-radius: 2px; font-size: 13px; color: var(--cream-dim); text-align: center; cursor: pointer; text-decoration: none; display: block; letter-spacing: .04em; transition: all .15s; }
.qa-btn:active { background: var(--bg-2); }
.qa-btn.urge { border-color: var(--red-deep); color: var(--red); }

.footer-note { margin: 28px 22px 0; padding: 16px 0; border-top: 1px solid var(--line); font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); line-height: 1.5; text-align: center; }

/* Generic page heads */
.page { padding: 22px 22px 0; }
.page-title { font-family: 'Fraunces', serif; font-size: 26px; color: var(--cream); margin-bottom: 6px; }
.page-sub { font-family: 'Fraunces', serif; font-style: italic; color: var(--muted); font-size: 14px; margin-bottom: 22px; line-height: 1.4; }
.section-h { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--gold); letter-spacing: .06em; margin: 26px 0 12px; }

/* Week */
.week-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-bottom: 24px; }
.week-day { background: var(--bg-2); border: 1px solid var(--line); padding: 10px 2px 12px; text-align: center; border-radius: 2px; }
.week-day.today { border-color: var(--gold-deep); }
.week-day.future { opacity: .4; }
.week-day-name { font-family: 'Fraunces', serif; font-style: italic; font-size: 10px; color: var(--muted); letter-spacing: .12em; }
.week-day-num { font-family: 'Fraunces', serif; font-size: 15px; color: var(--cream-dim); margin-top: 3px; }
.week-day.today .week-day-num { color: var(--gold); font-weight: 500; }
.week-dots { display: flex; justify-content: center; gap: 3px; margin-top: 8px; }
.week-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--line-2); }
.week-dot.done { background: var(--gold); box-shadow: 0 0 4px rgba(212,168,74,.6); }
.pillar-stats { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 16px; }
.pillar-stat { padding: 14px 14px 12px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 2px; }
.pillar-stat-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); letter-spacing: .05em; }
.pillar-stat-val { font-family: 'Fraunces', serif; font-weight: 300; font-size: 26px; color: var(--cream); margin-top: 3px; line-height: 1; font-variant-numeric: tabular-nums; }
.pillar-stat-total { font-size: 16px; color: var(--muted-2); margin-left: 3px; }
.sabbat { margin-top: 24px; padding: 18px 20px; background: var(--bg-2); border: 1px solid var(--line); border-left: 2px solid var(--gold-deep); border-radius: 2px; }
.sabbat-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--gold); letter-spacing: .08em; text-transform: uppercase; }
.sabbat-text { font-family: 'Fraunces', serif; font-style: italic; font-size: 14px; color: var(--cream-dim); margin-top: 8px; line-height: 1.45; }

/* Vitality */
.vit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
.vit-cell { padding: 16px 14px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; user-select: none; transition: all .18s; }
.vit-cell:active { transform: scale(.97); }
.vit-cell.on { background: linear-gradient(165deg, rgba(94,116,68,.2), rgba(94,116,68,.06)); border-color: var(--green); }
.vit-label { font-family: 'Fraunces', serif; font-size: 17px; color: var(--cream-dim); }
.vit-cell.on .vit-label { color: var(--cream); }
.vit-q { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); margin-top: 4px; line-height: 1.3; }
.vit-score { text-align: center; font-family: 'Fraunces', serif; font-style: italic; color: var(--muted); font-size: 13px; margin-top: 14px; }

/* Evening */
.even-step { padding: 22px 0; border-bottom: 1px solid var(--line); }
.even-step:first-of-type { padding-top: 4px; }
.even-step:last-of-type { border-bottom: 0; }
.even-num { font-family: 'Fraunces', serif; font-style: italic; font-size: 11px; color: var(--gold); letter-spacing: .12em; text-transform: uppercase; }
.even-q { font-family: 'Fraunces', serif; font-size: 19px; color: var(--cream); margin-top: 5px; line-height: 1.3; }
.textarea, .input { width: 100%; margin-top: 12px; padding: 12px 14px; background: var(--bg); border: 1px solid var(--line); border-radius: 2px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--cream); resize: vertical; line-height: 1.5; }
.textarea { min-height: 60px; }
.textarea:focus, .input:focus { outline: none; border-color: var(--gold-deep); }
.input::placeholder, .textarea::placeholder { color: var(--muted-2); font-family: 'Fraunces', serif; font-style: italic; }

.primary-btn { margin-top: 26px; width: 100%; padding: 16px; background: var(--gold); color: var(--bg); border: 0; border-radius: 2px; font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: .1em; text-transform: uppercase; transition: filter .15s; }
.primary-btn:active { filter: brightness(.88); }
.ghost-btn { padding: 8px 0; font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--muted); background: transparent; border: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.closed-state { text-align: center; padding: 46px 20px; }
.closed-mark { font-family: 'Fraunces', serif; font-size: 36px; color: var(--gold); margin: 20px 0; }
.closed-text { font-family: 'Fraunces', serif; font-style: italic; color: var(--cream-dim); font-size: 15px; line-height: 1.5; margin-bottom: 24px; }

/* Journal entries */
.journal-entry { padding: 16px 0; border-bottom: 1px solid var(--line); }
.journal-date { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--gold); letter-spacing: .04em; }
.journal-line { font-size: 14px; color: var(--cream-dim); margin-top: 6px; line-height: 1.45; }
.journal-line b { font-family: 'Fraunces', serif; font-weight: 400; font-style: italic; color: var(--muted); margin-right: 6px; }

/* Settings */
.set-row { padding: 16px 0; border-bottom: 1px solid var(--line); }
.set-pillar-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 11px; color: var(--gold); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 8px; }
.set-actions { display: flex; gap: 8px; margin-top: 8px; }
.set-btn { flex: 1; padding: 14px; background: transparent; border: 1px solid var(--line-2); border-radius: 2px; color: var(--cream-dim); font-size: 13px; cursor: pointer; letter-spacing: .04em; }
.set-btn.danger { border-color: var(--red-deep); color: var(--red); }

/* Nav */
.nav { position: fixed; bottom: 0; left: 0; right: 0; max-width: 520px; margin: 0 auto; padding: 10px 6px calc(10px + env(safe-area-inset-bottom, 10px)); background: rgba(18,13,7,.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid var(--line); display: flex; z-index: 100; }
.nav-btn { flex: 1; padding: 10px 2px; background: transparent; border: 0; font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--muted); cursor: pointer; letter-spacing: .02em; text-align: center; position: relative; transition: color .15s; }
.nav-btn.active { color: var(--gold); }
.nav-btn.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 16px; height: 1px; background: var(--gold); }

/* Urge overlay */
.urge-overlay { position: fixed; inset: 0; background: #050301; color: var(--cream); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; padding: 32px; text-align: center; animation: fadeIn .4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.urge-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--gold-dim); letter-spacing: .15em; margin-bottom: 14px; text-transform: uppercase; }
.urge-instruction { font-family: 'Fraunces', serif; font-weight: 300; font-size: 22px; line-height: 1.45; margin-bottom: 42px; color: var(--cream); max-width: 320px; white-space: pre-line; }
.breath-circle { width: 200px; height: 200px; border-radius: 50%; border: 1px solid rgba(212,168,74,.28); display: flex; align-items: center; justify-content: center; margin-bottom: 38px; animation: breath 8s ease-in-out infinite; }
.breath-inner { width: 60%; height: 60%; border-radius: 50%; background: rgba(212,168,74,.06); border: 1px solid rgba(212,168,74,.2); }
@keyframes breath { 0%,100% { transform: scale(1); border-color: rgba(212,168,74,.18); } 50% { transform: scale(1.2); border-color: rgba(212,168,74,.55); } }
.urge-countdown { font-family: 'Fraunces', serif; font-size: 52px; font-weight: 300; margin-bottom: 10px; font-variant-numeric: tabular-nums; color: var(--cream); }
.urge-cta { margin-top: 38px; background: transparent; border: 1px solid rgba(242,233,215,.3); color: var(--cream-dim); padding: 13px 28px; border-radius: 2px; font-size: 13px; cursor: pointer; letter-spacing: .08em; text-transform: uppercase; }
.urge-cta.primary { background: var(--gold); color: var(--bg); border-color: var(--gold); font-weight: 600; }

/* Rank up */
.rankup { position: fixed; inset: 0; background: rgba(5,3,1,.94); z-index: 900; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; animation: fadeIn .5s ease; }
.rankup-label { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--gold-dim); letter-spacing: .2em; text-transform: uppercase; margin-bottom: 16px; }
.rankup-name { font-family: 'Fraunces', serif; font-size: 44px; color: var(--gold); line-height: 1.05; margin-bottom: 26px; text-shadow: 0 0 40px rgba(212,168,74,.25); }
.rankup-verse { font-family: 'Fraunces', serif; font-style: italic; color: var(--cream-dim); font-size: 16px; max-width: 320px; line-height: 1.5; }

/* Onboarding */
.onb { padding: 40px 28px; min-height: 100vh; display: flex; flex-direction: column; }
.onb-kicker { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--gold); letter-spacing: .14em; text-transform: uppercase; }
.onb-title { font-family: 'Fraunces', serif; font-weight: 300; font-size: 34px; line-height: 1.15; color: var(--cream); margin-top: 16px; }
.onb-body { font-family: 'Fraunces', serif; font-style: italic; font-size: 16px; color: var(--cream-dim); margin-top: 18px; line-height: 1.5; }
.onb-pillar-edit { margin-top: 18px; }
.onb-spacer { flex: 1; }
`;

/* ============== BADGE SVG ============== */

function BlasonBadge({ dayTasks, pillars }) {
  const cx = 140, cy = 140, ro = 110, ri = 70;
  const arc = (s, e) => {
    const r = (d) => (d - 90) * Math.PI / 180;
    const sa = r(s), ea = r(e);
    const x1 = cx + ro * Math.cos(sa), y1 = cy + ro * Math.sin(sa);
    const x2 = cx + ro * Math.cos(ea), y2 = cy + ro * Math.sin(ea);
    const x3 = cx + ri * Math.cos(ea), y3 = cy + ri * Math.sin(ea);
    const x4 = cx + ri * Math.cos(sa), y4 = cy + ri * Math.sin(sa);
    const large = e - s > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${ro} ${ro} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 ${large} 0 ${x4} ${y4} Z`;
  };
  const gap = 2;
  const quads = [
    { start: 315 + gap, end: 45 - gap + 360 },
    { start: 45 + gap, end: 135 - gap },
    { start: 135 + gap, end: 225 - gap },
    { start: 225 + gap, end: 315 - gap },
  ];
  const labels = pillars.map((p) => (p.label || '').toUpperCase().slice(0, 9));

  return (
    <svg viewBox="0 0 280 280" width="232" height="232">
      <defs>
        <radialGradient id="goldFill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#E8C16A" /><stop offset="70%" stopColor="#C9A14A" /><stop offset="100%" stopColor="#8B6E30" />
        </radialGradient>
        <radialGradient id="dimFill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#2F251A" /><stop offset="100%" stopColor="#1A120B" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {quads.map((q, i) => {
        const done = pillars[i] && dayTasks[pillars[i].key];
        return <path key={i} d={arc(q.start, q.end)} fill={done ? 'url(#goldFill)' : 'url(#dimFill)'} stroke={done ? '#D4A84A' : '#2F2418'} strokeWidth="0.5" style={{ transition: 'fill .5s' }} />;
      })}
      <circle cx={cx} cy={cy} r={ro} fill="none" stroke="#453422" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={ri} fill="none" stroke="#453422" strokeWidth="1" />
      <g stroke="#D4A84A" strokeWidth="2" strokeLinecap="round" filter="url(#glow)">
        <line x1={cx} y1={cy - 28} x2={cx} y2={cy + 28} /><line x1={cx - 22} y1={cy} x2={cx + 22} y2={cy} />
      </g>
      <g fontFamily="Fraunces, serif" fontStyle="italic" fontSize="9" fill="#7E7360" letterSpacing="1.5">
        <text x={cx} y="18" textAnchor="middle">{labels[0]}</text>
        <text x="262" y={cy + 3} textAnchor="middle">{labels[1]}</text>
        <text x={cx} y="270" textAnchor="middle">{labels[2]}</text>
        <text x="18" y={cy + 3} textAnchor="middle">{labels[3]}</text>
      </g>
    </svg>
  );
}

const Icon = ({ name }) => {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'priere': return <svg {...p}><path d="M12 2 L12 22" /><path d="M8 7 L16 7" /></svg>;
    case 'sport': return <svg {...p}><path d="M6.5 6.5 L17.5 17.5" /><path d="M4 9 L9 4 L11 6 L6 11 Z" /><path d="M13 18 L18 13 L20 15 L15 20 Z" /></svg>;
    case 'nutrition': return <svg {...p}><path d="M12 3 C8 8 8 14 12 21 C16 14 16 8 12 3 Z" /></svg>;
    case 'controle': return <svg {...p}><path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" /></svg>;
    case 'book': return <svg {...p}><path d="M4 4 H16 A2 2 0 0 1 18 6 V20 H6 A2 2 0 0 1 4 18 Z" /><path d="M18 6 H20 V18" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
};

/* ============== ONBOARDING ============== */

function Onboarding({ onDone }) {
  const [pillars, setPillars] = useState(DEFAULT_PILLARS.map((p) => ({ ...p })));
  const [step, setStep] = useState(0);

  if (step === 0) {
    return (
      <div className="onb">
        <div className="onb-kicker">Regula</div>
        <div className="onb-title">Reprendre le contrôle, un jour à la fois.</div>
        <div className="onb-body">
          Quatre piliers. Tu les valides chaque soir. Un blason s'allume,
          un rang se gagne — lentement, sans série fragile à préserver.
          <br /><br />
          Tu peux garder les piliers proposés ou les ajuster à ta vie.
        </div>
        <div className="onb-spacer" />
        <button className="primary-btn" onClick={() => setStep(1)}>Commencer</button>
      </div>
    );
  }

  return (
    <div className="onb">
      <div className="onb-kicker">Tes quatre piliers</div>
      <div className="onb-title" style={{ fontSize: 26 }}>Définis ta règle.</div>
      <div className="onb-body" style={{ fontSize: 14, marginTop: 12 }}>
        Une phrase concrète pour chacun : la condition exacte qui te fait cocher le soir.
      </div>
      {pillars.map((p, i) => (
        <div key={i} className="onb-pillar-edit">
          <div className="set-pillar-label">{p.label}</div>
          <input className="input" style={{ marginTop: 0 }} value={p.label}
            onChange={(e) => { const n = [...pillars]; n[i].label = e.target.value; setPillars(n); }} />
          <input className="input" placeholder="Ma règle concrète" value={p.sub}
            onChange={(e) => { const n = [...pillars]; n[i].sub = e.target.value; setPillars(n); }} />
        </div>
      ))}
      <div className="onb-spacer" style={{ minHeight: 24 }} />
      <button className="primary-btn" onClick={() => onDone(pillars)}>Entrer dans la règle</button>
    </div>
  );
}

/* ============== TODAY ============== */

function TodayView({ state, setState, openUrge, onRankUp }) {
  const today = toISODate();
  const dayTasks = state.tasks[today] || {};
  const pillars = state.pillars;
  const liturgy = useMemo(() => getLiturgy(new Date()), []);
  const points = useMemo(() => totalPoints(state.tasks, pillars), [state.tasks, pillars]);
  const rank = useMemo(() => currentRank(points), [points]);
  const controlKey = pillars[3]?.key;
  const streak = useMemo(() => cleanStreak(state.tasks, controlKey), [state.tasks, controlKey]);
  const doneCount = pillars.filter((p) => dayTasks[p.key]).length;
  const rankProgress = rank.next ? ((points - rank.current.threshold) / (rank.next.threshold - rank.current.threshold)) * 100 : 100;

  const toggle = (key) => {
    haptic(dayTasks[key] ? 8 : 16);
    const prevPoints = totalPoints(state.tasks, pillars);
    const newDay = { ...dayTasks, [key]: !dayTasks[key] };
    setState((s) => ({ ...s, tasks: { ...s.tasks, [today]: newDay } }));
    const newPoints = totalPoints({ ...state.tasks, [today]: newDay }, pillars);
    if (currentRank(prevPoints).current.name !== currentRank(newPoints).current.name)
      setTimeout(() => onRankUp(currentRank(newPoints).current.name), 350);
  };

  return (
    <div>
      <div className="badge-wrap">
        <BlasonBadge dayTasks={dayTasks} pillars={pillars} />
        <div className="badge-count">
          <div className="badge-count-num">{doneCount}<span style={{ color: 'var(--muted-2)', fontSize: 28 }}>/4</span></div>
          <div className="badge-count-total">aujourd’hui</div>
        </div>
      </div>

      <div className="rank-block">
        <div className="rank-name">{rank.current.name}</div>
        <div className="rank-sub">{rank.next ? `vers ${rank.next.name}` : 'au sommet de la règle'}</div>
        <div className="rank-bar"><div className="rank-bar-fill" style={{ width: `${Math.min(100, rankProgress)}%` }} /></div>
        <div className="rank-bar-meta">{rank.next ? `${points - rank.current.threshold} / ${rank.next.threshold - rank.current.threshold}` : `${points} actes`}</div>
      </div>

      <div className="quote-card">
        <div className="quote-text">« {liturgy.quote} »</div>
        <div className="quote-author">— {liturgy.author}</div>
      </div>

      <div className="pillar-grid">
        {pillars.map((p, i) => (
          <div key={p.key} className={`pillar ${dayTasks[p.key] ? 'done' : ''}`} onClick={() => toggle(p.key)}>
            {i === 3 && streak > 0 && <div className="pillar-streak">{streak}j</div>}
            <div className="pillar-icon"><Icon name={p.icon || 'controle'} /></div>
            <div>
              <div className="pillar-label">{p.label}</div>
              <div className="pillar-sub">{p.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <div className="qa-row">
          <a className="qa-btn" href="shortcuts://run-shortcut?name=Pomodoro%2025">Focus 25 min</a>
          <a className="qa-btn" href="shortcuts://run-shortcut?name=Laudes">Laudes</a>
        </div>
        <button className="qa-btn urge" onClick={openUrge}>J’ai envie de scroller</button>
      </div>

      <div className="footer-note">
        Règle des 60 minutes : pas d’écran la première heure après le réveil,<br />ni la dernière heure avant le coucher.
      </div>
    </div>
  );
}

/* ============== VITALITÉ ============== */

function VitalityView({ state, setState }) {
  const today = toISODate();
  const v = state.vitality[today] || {};
  const score = VITALITY.filter((x) => v[x.key]).length;

  const toggle = (key) => {
    haptic(12);
    setState((s) => ({ ...s, vitality: { ...s.vitality, [today]: { ...v, [key]: !v[key] } } }));
  };

  const days = daysOfWeek();
  const now = new Date();
  const weekAvg = useMemo(() => {
    let total = 0, denom = 0;
    days.forEach((d) => {
      if (d > now) return;
      denom++;
      const dv = state.vitality[toISODate(d)] || {};
      total += VITALITY.filter((x) => dv[x.key]).length;
    });
    return denom ? (total / denom).toFixed(1) : '0';
  }, [state.vitality, days, now]);

  return (
    <div className="page">
      <div className="page-title">Vitalité</div>
      <div className="page-sub">
        Les leviers réels de l’énergie et de la testostérone. Coche ce qui a été tenu aujourd’hui.
      </div>
      <div className="vit-grid">
        {VITALITY.map((x) => (
          <div key={x.key} className={`vit-cell ${v[x.key] ? 'on' : ''}`} onClick={() => toggle(x.key)}>
            <div className="vit-label">{x.label}</div>
            <div className="vit-q">{x.q}</div>
          </div>
        ))}
      </div>
      <div className="vit-score">Aujourd’hui : {score}/4 · moyenne de la semaine : {weekAvg}/4</div>

      <div className="section-h">Ce qui compte vraiment</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--cream-dim)', fontSize: 14, lineHeight: 1.6 }}>
        Sommeil profond, lumière du matin, effort de force, sobriété sur le sucre et l’alcool :
        ce sont les vrais leviers hormonaux, validés par la science. Pas de poudre, pas de raccourci.
        La constance sur ces quatre points fait plus que n’importe quel complément.
      </div>
    </div>
  );
}

/* ============== WEEK ============== */

function WeekView({ state }) {
  const days = daysOfWeek();
  const now = new Date();
  const todayStr = toISODate();
  const pillars = state.pillars;
  const points = useMemo(() => totalPoints(state.tasks, pillars), [state.tasks, pillars]);
  const rank = useMemo(() => currentRank(points), [points]);
  const rankProgress = rank.next ? ((points - rank.current.threshold) / (rank.next.threshold - rank.current.threshold)) * 100 : 100;

  const stats = useMemo(() => {
    const s = {}; pillars.forEach((p) => s[p.key] = 0);
    let denom = 0;
    days.forEach((d) => { if (d > now) return; denom++; const t = state.tasks[toISODate(d)]; if (t) pillars.forEach((p) => { if (t[p.key]) s[p.key]++; }); });
    return { s, denom: denom || 1 };
  }, [state.tasks, days, now, pillars]);

  return (
    <div className="page">
      <div className="page-title">Cette semaine</div>
      <div className="page-sub">Le rang se gagne acte après acte. Pas de série à préserver.</div>
      <div className="week-grid">
        {days.map((d, i) => {
          const k = toISODate(d);
          const t = state.tasks[k] || {};
          const isToday = k === todayStr;
          const isFuture = d > now && !isToday;
          return (
            <div key={k} className={`week-day ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}>
              <div className="week-day-name">{DAY_NAMES_SHORT[(i + 1) % 7]}</div>
              <div className="week-day-num">{d.getDate()}</div>
              <div className="week-dots">{pillars.map((p) => <div key={p.key} className={`week-dot ${t[p.key] ? 'done' : ''}`} />)}</div>
            </div>
          );
        })}
      </div>
      <div className="pillar-stats">
        {pillars.map((p) => (
          <div key={p.key} className="pillar-stat">
            <div className="pillar-stat-label">{p.label}</div>
            <div className="pillar-stat-val">{stats.s[p.key]}<span className="pillar-stat-total">/{stats.denom}</span></div>
          </div>
        ))}
      </div>
      <div className="rank-block" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="rank-name" style={{ fontSize: 20 }}>{rank.current.name}</div>
        <div className="rank-sub">{rank.next ? `${rank.next.threshold - points} actes vers ${rank.next.name}` : 'au sommet'}</div>
        <div className="rank-bar"><div className="rank-bar-fill" style={{ width: `${Math.min(100, rankProgress)}%` }} /></div>
        <div className="rank-bar-meta">{points} actes au total</div>
      </div>
      <div className="sabbat">
        <div className="sabbat-label">Dimanche · Jour du Seigneur</div>
        <div className="sabbat-text">Le sabbat n’est pas un jour de discipline mais de libération. Messe, famille, repos. Le rang tient même sans marquer.</div>
      </div>
    </div>
  );
}

/* ============== EVENING ============== */

function EveningView({ state, saveCheckin }) {
  const today = toISODate();
  const existing = state.checkins[today];
  const [step, setStep] = useState(existing ? 'done' : 'form');
  const [form, setForm] = useState(existing || { gratitude: '', contrition: '', resolution: '' });
  const [showJournal, setShowJournal] = useState(false);

  const pastEntries = useMemo(() =>
    Object.entries(state.checkins).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 30),
    [state.checkins]);

  if (showJournal) {
    return (
      <div className="page">
        <div className="page-title">Carnet</div>
        <div className="page-sub">Tes examens passés.</div>
        {pastEntries.length === 0 && <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--muted)' }}>Encore rien d’écrit.</div>}
        {pastEntries.map(([date, c]) => {
          const d = new Date(date + 'T12:00');
          return (
            <div key={date} className="journal-entry">
              <div className="journal-date">{formatLongDate(d)}</div>
              {c.gratitude && <div className="journal-line"><b>grâce</b>{c.gratitude}</div>}
              {c.contrition && <div className="journal-line"><b>pardon</b>{c.contrition}</div>}
              {c.resolution && <div className="journal-line"><b>demain</b>{c.resolution}</div>}
            </div>
          );
        })}
        <button className="ghost-btn" style={{ marginTop: 20 }} onClick={() => setShowJournal(false)}>← Retour à l’examen</button>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="page">
        <div className="page-title">Journée close</div>
        <div className="closed-state">
          <div className="closed-mark">✦</div>
          <div className="closed-text"><em>In manus tuas, Domine,<br />commendo spiritum meum.</em><br /><br />Pose le téléphone. Bonne nuit.</div>
          <button className="ghost-btn" onClick={() => setStep('form')}>Revenir sur l’examen</button>
          <br /><button className="ghost-btn" onClick={() => setShowJournal(true)}>Voir le carnet</button>
        </div>
      </div>
    );
  }

  const save = () => { haptic(20); saveCheckin(today, { ...form, savedAt: new Date().toISOString() }); setStep('done'); };

  return (
    <div className="page">
      <div className="page-title">Examen du soir</div>
      <div className="page-sub">Trois questions. Cinq minutes. Pas plus.</div>
      <div className="even-step">
        <div className="even-num">i — Action de grâce</div>
        <div className="even-q">De quoi rends-tu grâce ?</div>
        <textarea className="textarea" placeholder="Une grâce reçue. Un don. Une consolation." value={form.gratitude} onChange={(e) => setForm({ ...form, gratitude: e.target.value })} />
      </div>
      <div className="even-step">
        <div className="even-num">ii — Contrition</div>
        <div className="even-q">De quoi demander pardon ?</div>
        <textarea className="textarea" placeholder="Sans se flageller. Nommer suffit." value={form.contrition} onChange={(e) => setForm({ ...form, contrition: e.target.value })} />
      </div>
      <div className="even-step">
        <div className="even-num">iii — Résolution</div>
        <div className="even-q">Une intention pour demain ?</div>
        <input className="input" placeholder="Concrète. Une seule phrase." value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} />
      </div>
      <button className="primary-btn" onClick={save}>Clore la journée</button>
      <div style={{ textAlign: 'center', marginTop: 12 }}><button className="ghost-btn" onClick={() => setShowJournal(true)}>Voir le carnet</button></div>
    </div>
  );
}

/* ============== SETTINGS ============== */

function SettingsView({ state, setState }) {
  const [pillars, setPillars] = useState(state.pillars.map((p) => ({ ...p })));
  const fileRef = useRef(null);

  const savePillars = () => { haptic(16); setState((s) => ({ ...s, pillars })); alert('Piliers enregistrés.'); };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `regula-sauvegarde-${toISODate()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.version && data.tasks) { setState(data); alert('Données restaurées.'); }
        else alert('Fichier invalide.');
      } catch { alert('Fichier illisible.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page">
      <div className="page-title">Réglages</div>
      <div className="page-sub">Personnalise tes piliers et protège tes données.</div>

      <div className="section-h">Tes quatre piliers</div>
      {pillars.map((p, i) => (
        <div key={i} className="set-row">
          <div className="set-pillar-label">Pilier {i + 1}</div>
          <input className="input" style={{ marginTop: 0 }} value={p.label} onChange={(e) => { const n = [...pillars]; n[i].label = e.target.value; setPillars(n); }} />
          <input className="input" placeholder="Règle concrète" value={p.sub} onChange={(e) => { const n = [...pillars]; n[i].sub = e.target.value; setPillars(n); }} />
        </div>
      ))}
      <button className="primary-btn" onClick={savePillars}>Enregistrer les piliers</button>

      <div className="section-h">Sauvegarde</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
        Tes données vivent sur cet appareil. Exporte régulièrement un fichier de sauvegarde — surtout avant de changer de téléphone.
      </div>
      <div className="set-actions">
        <button className="set-btn" onClick={exportData}>Exporter</button>
        <button className="set-btn" onClick={() => fileRef.current?.click()}>Importer</button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={importData} />
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============== OVERLAYS ============== */

function UrgeSurf({ onClose, onDone }) {
  const [count, setCount] = useState(60);
  useEffect(() => {
    if (count === 0) { haptic(40); return; }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count]);
  const done = count === 0;
  return (
    <div className="urge-overlay">
      <div className="urge-label">la vague passe</div>
      <div className="urge-instruction">{done ? 'La compulsion est passée.\nTu n’avais pas besoin d’elle.' : 'Respire avec le cercle.\nL’envie est une vague —\nelle se dissipe si tu ne la nourris pas.'}</div>
      {!done && <><div className="breath-circle"><div className="breath-inner" /></div><div className="urge-countdown">{count}</div></>}
      <button className={`urge-cta ${done ? 'primary' : ''}`} onClick={done ? onDone : onClose}>{done ? 'Valider le contrôle' : 'Passer'}</button>
    </div>
  );
}

function RankUp({ rank, onClose }) {
  useEffect(() => { haptic(60); const id = setTimeout(onClose, 4500); return () => clearTimeout(id); }, [onClose]);
  return (
    <div className="rankup" onClick={onClose}>
      <div className="rankup-label">tu t’élèves</div>
      <div className="rankup-name">{rank}</div>
      <div className="rankup-verse">« À celui qui vaincra, je donnerai de s’asseoir avec moi sur mon trône. »<br /><br /><span style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '.12em' }}>AP 3, 21</span></div>
    </div>
  );
}

function BottomNav({ view, setView }) {
  const tabs = [
    { key: 'today', label: 'Aujourd\u2019hui' },
    { key: 'vitality', label: 'Vitalité' },
    { key: 'week', label: 'Semaine' },
    { key: 'evening', label: 'Soir' },
    { key: 'settings', label: 'Réglages' },
  ];
  return (
    <nav className="nav">
      {tabs.map((t) => (
        <button key={t.key} className={`nav-btn ${view === t.key ? 'active' : ''}`} onClick={() => setView(t.key)}>{t.label}</button>
      ))}
    </nav>
  );
}

/* ============== APP ============== */

export default function App() {
  const [state, setState] = useState(load);
  const [view, setView] = useState('today');
  const [urgeOpen, setUrgeOpen] = useState(false);
  const [rankUp, setRankUp] = useState(null);

  useEffect(() => { saveLS(state); }, [state]);

  const completeOnboarding = (pillars) => setState((s) => ({ ...s, pillars, onboarded: true }));
  const saveCheckin = (date, c) => setState((s) => ({ ...s, checkins: { ...s.checkins, [date]: c } }));

  const onUrgeDone = () => {
    const today = toISODate();
    const controlKey = state.pillars[3]?.key;
    const prevPoints = totalPoints(state.tasks, state.pillars);
    const dayTasks = state.tasks[today] || {};
    if (controlKey && !dayTasks[controlKey]) {
      const newDay = { ...dayTasks, [controlKey]: true };
      setState((s) => ({ ...s, tasks: { ...s.tasks, [today]: newDay } }));
      const newPoints = totalPoints({ ...state.tasks, [today]: newDay }, state.pillars);
      if (currentRank(prevPoints).current.name !== currentRank(newPoints).current.name)
        setTimeout(() => setRankUp(currentRank(newPoints).current.name), 350);
    }
    setUrgeOpen(false);
  };

  if (!state.onboarded) {
    return (<><style>{css}</style><div className="app">
      <Onboarding onDone={completeOnboarding} />
    </div></>);
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="h-date">{formatLongDate(new Date())}</div>
          <div className="h-saint">{getLiturgy(new Date()).saint}</div>
        </header>
        {view === 'today' && <TodayView state={state} setState={setState} openUrge={() => setUrgeOpen(true)} onRankUp={(r) => setRankUp(r)} />}
        {view === 'vitality' && <VitalityView state={state} setState={setState} />}
        {view === 'week' && <WeekView state={state} />}
        {view === 'evening' && <EveningView state={state} saveCheckin={saveCheckin} />}
        {view === 'settings' && <SettingsView state={state} setState={setState} />}
        <BottomNav view={view} setView={setView} />
        {urgeOpen && <UrgeSurf onClose={() => setUrgeOpen(false)} onDone={onUrgeDone} />}
        {rankUp && <RankUp rank={rankUp} onClose={() => setRankUp(null)} />}
      </div>
    </>
  );
}

