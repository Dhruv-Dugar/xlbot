// Dependency-free keyword/fuzzy matcher (Step 6, Option A).
// No API key, no backend, runs entirely client-side.

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'my', 'do', 'does', 'did', 'how', 'to',
  'for', 'i', 'what', 'of', 'on', 'in', 'can', 'will', 'am', 'about',
  'me', 'it', 'this', 'that', 'and', 'or', 'be', 'was', 'were', 'get',
  'please', 'need', 'want', 'know', 'there', 'you', 'your',
])

export function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s%]/g, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length > 0 && !STOPWORDS.has(tok))
}

export function levenshtein(a, b) {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let curr = new Array(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      )
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

function tokenSimilarity(a, b) {
  if (a === b) return 1
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return 0.9
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  const tolerance = maxLen <= 5 ? 1 : 2
  if (dist <= tolerance) return 0.75
  return 0
}

// Precision-oriented score: what fraction of this canned phrasing's
// keywords are present (exactly or fuzzily) in the user's free-text query.
// Deliberately not symmetric — a long free-text query with a lot of filler
// words shouldn't be penalized for not resembling a short canned phrasing.
function phraseScore(inputTokens, targetTokens) {
  if (inputTokens.length === 0 || targetTokens.length === 0) return 0
  let matched = 0
  for (const targetTok of targetTokens) {
    let best = 0
    for (const inTok of inputTokens) {
      const sim = tokenSimilarity(inTok, targetTok)
      if (sim > best) best = sim
    }
    matched += best
  }
  return matched / targetTokens.length
}

/**
 * Matches a free-text query against the FAQ list.
 * Returns the best match (if above threshold) plus a ranked list of
 * near-misses to power the "did you mean" fallback flow.
 */
export function matchQuery(query, faqList, threshold = 0.34) {
  const inputTokens = normalize(query)

  const scored = faqList.map((faq) => {
    const candidates = [faq.intent_name, ...faq.sample_user_phrasings]
    let best = 0
    for (const phrasing of candidates) {
      const s = phraseScore(inputTokens, normalize(phrasing))
      if (s > best) best = s
    }
    return { faq, score: best }
  })

  scored.sort((a, b) => b.score - a.score)

  const best = scored[0] && scored[0].score >= threshold ? scored[0] : null
  const suggestions = scored.filter((s) => s !== scored[0] || !best).slice(0, 3)

  return { best, suggestions, ranked: scored }
}
