/* ============ ranks.js — rangos de dificultad ============
 * Opcionales: el rango Normal es el juego de siempre. Cada rango sube la vida,
 * el daño y la cantidad de enemigos, adelanta a los jefes y, en los altos, cura
 * menos y trae élites desde el principio. A cambio, más premio al acabar
 * (monedas y tickets), con tope de +50%.
 *
 * Se desbloquea el siguiente al llegar a la Sentencia de Arceus (minuto 30) en
 * el anterior, con cualquier Pokémon (save.ranks.unlocked).
 *
 *   hp, dmg   multiplican la vida y el daño de los enemigos (también jefes)
 *   rate      multiplica cuántos enemigos salen
 *   bossT     multiplica el minuto en que llega cada jefe (<1 = antes)
 *   heal      multiplica lo que curan los corazones del suelo
 *   elite     probabilidad de que un enemigo salga como élite desde el principio
 *   reward    premio extra al acabar (0,1 = +10%)
 */
G.Ranks = (() => {
  const LIST = [
    { id: 0, name: 'Normal',   color: '#cbd5e1', hp: 1,    dmg: 1,    rate: 1,    bossT: 1,    heal: 1,    elite: 0,    reward: 0 },
    { id: 1, name: 'Bronce',   color: '#d9915a', hp: 1.25, dmg: 1.15, rate: 1.1,  bossT: 0.95, heal: 1,    elite: 0,    reward: 0.1 },
    { id: 2, name: 'Plata',    color: '#c9d6e3', hp: 1.5,  dmg: 1.3,  rate: 1.2,  bossT: 0.9,  heal: 0.9,  elite: 0,    reward: 0.2 },
    { id: 3, name: 'Oro',      color: '#ffd23f', hp: 1.8,  dmg: 1.45, rate: 1.3,  bossT: 0.85, heal: 0.75, elite: 0.05, reward: 0.3 },
    { id: 4, name: 'Diamante', color: '#7fe3ff', hp: 2.2,  dmg: 1.6,  rate: 1.4,  bossT: 0.8,  heal: 0.6,  elite: 0.1,  reward: 0.4 },
    { id: 5, name: 'Maestro',  color: '#c58bff', hp: 2.7,  dmg: 1.8,  rate: 1.5,  bossT: 0.75, heal: 0.5,  elite: 0.15, reward: 0.5 }
  ];
  const MAX = LIST.length - 1;

  function get(id) { return LIST[Math.max(0, Math.min(MAX, id | 0))]; }

  /** El rango de la partida en curso (Normal fuera de partida). */
  function current() { return get(G.Game && G.Game.runCfg ? G.Game.runCfg.rank : 0); }

  /** Hasta qué rango tiene desbloqueado el jugador. */
  function unlocked() { const s = G.DB.save; return Math.max(0, Math.min(MAX, (s && s.ranks && s.ranks.unlocked) | 0)); }

  /** Texto corto de lo que cambia (para la pantalla de mapas). */
  function summary(r) {
    if (!r.id) return 'El juego de siempre.';
    const pct = k => '+' + Math.round((k - 1) * 100) + '%';
    const parts = [`Enemigos con ${pct(r.hp)} de vida y ${pct(r.dmg)} de daño`, `${pct(r.rate)} de enemigos`, 'jefes antes'];
    if (r.heal < 1) parts.push('los corazones curan menos');
    if (r.elite) parts.push('élites desde el principio');
    return parts.join(' · ') + `. Premio: +${Math.round(r.reward * 100)}% de monedas y tickets.`;
  }

  return { LIST, MAX, get, current, unlocked, summary };
})();
