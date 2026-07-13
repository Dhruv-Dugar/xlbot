import { useCallback, useState } from 'react'
import faqData from '../data/faq.json'
import botConfig from '../data/botConfig.json'
import { matchQuery } from '../lib/matcher'

let nextId = 1
function makeId() {
  return nextId++
}

function welcomeMessage() {
  return { id: makeId(), sender: 'bot', text: botConfig.welcome_message }
}

// Encapsulates all chat state + the intent-matching flow (Step 4 / Step 6
// Option A) so App.jsx stays a thin layout component.
export function useChatBot() {
  const [messages, setMessages] = useState(() => [welcomeMessage()])

  const pushMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: makeId(), ...msg }])
  }, [])

  const answerWithFaq = useCallback(
    (faq) => {
      pushMessage({
        sender: 'bot',
        text: faq.answer_text,
        source: faq.source,
        fallbackContact: faq.fallback_contact,
        showHelpful: true,
        faqId: faq.id,
      })
    },
    [pushMessage],
  )

  const handleChipSelect = useCallback(
    (faq) => {
      pushMessage({ sender: 'user', text: faq.chip_label })
      answerWithFaq(faq)
    },
    [pushMessage, answerWithFaq],
  )

  const handleUserQuery = useCallback(
    (rawText) => {
      const text = rawText.trim()
      if (!text) return
      pushMessage({ sender: 'user', text })

      const { best, suggestions } = matchQuery(text, faqData, botConfig.match_threshold)

      if (best) {
        answerWithFaq(best.faq)
        return
      }

      const closeSuggestions = suggestions.filter((s) => s.score > 0.15).slice(0, 3)
      pushMessage({
        sender: 'bot',
        text: closeSuggestions.length ? botConfig.unmatched_message : botConfig.no_guess_message,
        suggestionFaqs: closeSuggestions.map((s) => s.faq),
        fallbackContact: botConfig.default_fallback_contact,
      })
    },
    [pushMessage, answerWithFaq],
  )

  const handleHelpfulFeedback = useCallback(
    (messageId, wasHelpful, faqId) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, showHelpful: false, feedback: wasHelpful ? 'yes' : 'no' } : m,
        ),
      )
      const faq = faqData.find((f) => f.id === faqId)
      pushMessage({
        sender: 'bot',
        text: wasHelpful ? botConfig.helpful_yes_response : botConfig.helpful_no_response,
        fallbackContact: wasHelpful ? null : faq?.fallback_contact ?? botConfig.default_fallback_contact,
      })
    },
    [pushMessage],
  )

  return {
    messages,
    faqList: faqData,
    handleUserQuery,
    handleChipSelect,
    handleHelpfulFeedback,
  }
}
