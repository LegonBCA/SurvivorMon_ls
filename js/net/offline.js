/* ============ offline.js — SurvivorMon es sólo local ============
 * Sustituye a los módulos de red de PokéSurvivor (cooperativo, salas, amigos,
 * ranking y moderación), que necesitaban servidor y se han quitado. Deja la
 * misma "forma" (lo que el resto del juego consulta) con todo apagado:
 *   G.Coop     nunca activo (la partida es siempre en solitario)
 *   G.Social   sin cuenta, sin sala ni amigos; profileData() para tu tarjeta
 *   G.Ranking  sin tablas; periodIds() sigue dando el día/semana de las misiones
 * y pantallas vacías para los botones que ya no se ven.
 */
(() => {
  const nop = () => {};

  // ---------------- cooperativo ----------------
  G.Coop = {
    active: false, isHost: false, members: [],
    ANIMS: G.Sprites.ANIMS,
    players: () => [], puppets: () => [], mates: () => [],
    scaleHp: () => 1, scaleRate: () => 1, xpFactor: () => 1
  };
  for (const k of ['begin', 'end', 'leave', 'tick', 'broadcast', 'cast', 'collected', 'enemyAdded', 'enemyGone', 'enemyShot',
                   'hit', 'holdEnd', 'holdStart', 'hurtShown', 'levelStart', 'localPicked', 'over', 'pickupAdded', 'pickupGone',
                   'propBroken', 'say', 'shinyCaught', 'status', 'toHost']) G.Coop[k] = nop;

  // ---------------- cuenta, amigos y salas ----------------
  G.Social = {
    me: null, room: null, uid: null, friends: [], started: false, MAX_PLAYERS: 1,
    on: nop, start: nop, setOpen: nop, setPlaying: nop, publishProfile: nop, refreshPresence: nop, refreshMember: nop,
    getProfile: async () => null,
    /** Tu tarjeta de entrenador (Misiones > Perfil > "Ver mi perfil"). */
    profileData() {
      const s = G.DB.save, st = s.stats, prof = s.profile || {};
      const unlocked = G.AchDefs.LIST.filter(a => s.ach && s.ach[a.id]);
      const medals = unlocked.slice().sort((a, b) => (b.tier - a.tier) || (s.ach[b.id] - s.ach[a.id])).slice(0, 8).map(a => a.id);
      return {
        name: G.DB.user,
        favs: (prof.favs || []).slice(0, 3).map(f => ({ dex: f.dex | 0, shiny: !!f.shiny })),
        title: prof.title || '',
        best: { solo: st.bestTime | 0, group: st.bestGroupTime | 0, level: st.bestLevel | 0, bosses: st.bossesTotal | 0,
                legends: Object.keys(s.legends || {}).length, kills: st.totalKills | 0, medals: unlocked.length },
        medals
      };
    }
  };

  // ---------------- ranking ----------------
  // Las misiones (systems/progress.js) se sortean con el día y la semana de
  // España, como siempre (así nadie pierde las de hoy al actualizar).
  const TZ = 'Europe/Madrid';
  function madridDate(date) {
    const p = {};
    for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)) p[x.type] = x.value;
    return { y: +p.year, m: +p.month, d: +p.day };
  }
  function isoWeek(y, m, d) {
    const t = new Date(Date.UTC(y, m - 1, d));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return { year: t.getUTCFullYear(), week: Math.ceil(((t - y0) / 86400000 + 1) / 7) };
  }
  G.Ranking = {
    periodIds(date = new Date()) {
      const { y, m, d } = madridDate(date);
      const w = isoWeek(y, m, d);
      const p2 = n => String(n).padStart(2, '0');
      return { d: 'd' + y + p2(m) + p2(d), w: 'w' + w.year + '-' + p2(w.week), m: 'm' + y + p2(m), y: 'y' + y, a: 'all2' };
    },
    runStarted: nop, submitSolo: () => null, submitGroup: () => null, isAdmin: () => false
  };

  G.Net = {};

  // ---------------- pantallas que ya no se usan ----------------
  const off = () => G.UI.toast('SurvivorMon se juega sólo en tu navegador: no hay amigos ni ranking online.', 3200);
  G.SocialUI = { init: nop, needOnline: () => { off(); return false; } };
  G.FriendsUI = { open: off };
  G.LobbyUI = { open: nop, close: nop };
  G.RankingUI = { init: nop, open: off };
  G.ModUI = { init: nop };
})();
