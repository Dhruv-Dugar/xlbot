import { useState } from 'react'

function ChatInput({ onSend }) {
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <form className="chat-input-row" onSubmit={submit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your question, e.g. how is attendance calculated"
        aria-label="Type your question"
      />
      <button type="submit">Send</button>
    </form>
  )
}

export default ChatInput
