function MessageBubble({ message, onHelpfulFeedback, onSuggestionClick }) {
  const isBot = message.sender === 'bot'

  return (
    <div className={`bubble-row ${isBot ? 'bot' : 'user'}`}>
      <div className="bubble">
        <p>{message.text}</p>

        {message.suggestionFaqs && message.suggestionFaqs.length > 0 && (
          <div className="suggestion-list">
            {message.suggestionFaqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                className="suggestion-chip"
                onClick={() => onSuggestionClick(faq)}
              >
                {faq.chip_label}
              </button>
            ))}
          </div>
        )}

        {message.source && <p className="bubble-meta">Source: {message.source}</p>}
        {message.fallbackContact && (
          <p className="bubble-meta">Still stuck? Contact: {message.fallbackContact}</p>
        )}

        {message.showHelpful && (
          <div className="helpful-row">
            <span>Did this answer your question?</span>
            <button type="button" onClick={() => onHelpfulFeedback(message.id, true, message.faqId)}>
              Yes
            </button>
            <button type="button" onClick={() => onHelpfulFeedback(message.id, false, message.faqId)}>
              No
            </button>
          </div>
        )}
        {message.feedback && (
          <p className="bubble-meta feedback-ack">
            {message.feedback === 'yes' ? 'Marked as helpful.' : 'Marked as not helpful.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
