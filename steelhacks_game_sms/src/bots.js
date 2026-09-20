// --- tunable constants ---
export const BOT_THINK_MIN_MS = 1000
export const BOT_THINK_MAX_MS = { 1: 15000, 2: 11000, 3: 9000 }
const NOISE = 2
const PANIC_CHANCE = { high: 0.35, mid: 0.1, calm: 0 }

export function botThinkDelay(act) {
  const max = BOT_THINK_MAX_MS[act] ?? BOT_THINK_MAX_MS[1]
  const delay = BOT_THINK_MIN_MS + Math.random() * Math.max(0, max - BOT_THINK_MIN_MS)
  return delay
}

export function runBotTurn(bot, rival, forestHealth, choices, act) {
  if (!choices.length) return () => {}

  const maxMs = BOT_THINK_MAX_MS[act] ?? BOT_THINK_MAX_MS[1]
  let done = false

  const cancel = () => {
    done = true
    clearTimeout(thinkTimer)
    clearTimeout(deadlineTimer)
  }

  const finish = (choice) => {
    if (done) return
    cancel()
    applyChoice(bot, choice)
  }

  const thinkTimer = setTimeout(
    () => finish(chooseBotCard(choices, { bot, rival, forestHealth })),
    botThinkDelay(act)
  )

  // safety net: if the decision ever stalls, play a random card
  const deadlineTimer = setTimeout(() => {
    finish(choices[Math.floor(Math.random() * choices.length)])
  }, maxMs)

  return cancel
}

function stressBand(stress) {
  if (stress >= 66) return 'high'
  if (stress >= 33) return 'mid'
  return 'calm'
}

function topProfitCard(choices) {
  return choices.reduce((best, c) =>
    c.effects.profit > best.effects.profit ? c : best
  )
}

function scoreCard(card, { bot, rival, forestHealth }) {
  const e = card.effects
  const greed = bot.stress / 100 // 0 = calm, 1 = panicking

  // Stressed bots care more about profit and less about everything else.
  let profitWeight = 0.9 + greed * 0.6
  const forestBase = forestHealth < 40 ? 1.5 : 0.6 // a dying forest ends the game
  const forestWeight = forestBase * (1 - 0.5 * greed)
  const trustWeight = 0.3 * (1 - 0.5 * greed)
  const stressWeight = 0.3

  // Behind the rival? Push harder for profit.
  if (rival.profit - bot.profit > 10) profitWeight *= 1.2

  let score =
    e.profit * profitWeight +
    e.forest * forestWeight +
    e.trust * trustWeight -
    e.stress * stressWeight

  // This move would zero the forest and end the game immediately.
  // Great if it wins the game right now, terrible if it loses it.
  if (forestHealth + e.forest <= 0) {
    score += bot.profit + e.profit > rival.profit ? 25 : -100
  }

  return score + (Math.random() * 2 - 1) * NOISE
}

// Pick one of the offered cards. `context` = { bot, rival, forestHealth }.
export function chooseBotCard(choices, context) {
  if (!choices.length) return null

  if (Math.random() < PANIC_CHANCE[stressBand(context.bot.stress)]) {
    return topProfitCard(choices)
  }

  const scored = choices.map((card) => ({ card, score: scoreCard(card, context) }))
  return scored.reduce((best, s) => (s.score > best.score ? s : best)).card
}