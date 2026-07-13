import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function ChatWindow({ messages, onHelpfulFeedback, onSuggestionClick }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="chat-window">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onHelpfulFeedback={onHelpfulFeedback}
          onSuggestionClick={onSuggestionClick}
        />
      ))}
      <div ref={endRef} />
    </div>
  )
}

export default ChatWindow
