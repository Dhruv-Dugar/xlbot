import './App.css'
import ChatInput from './components/ChatInput'
import ChatWindow from './components/ChatWindow'
import QuickReplyChips from './components/QuickReplyChips'
import botConfig from './data/botConfig.json'
import { useChatBot } from './hooks/useChatBot'

function App() {
  const { messages, faqList, handleUserQuery, handleChipSelect, handleHelpfulFeedback } = useChatBot()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{botConfig.bot_name}</h1>
        <p className="app-subtitle">Prometheus Product Vertical &mdash; Academic FAQ Assistant (MVP)</p>
      </header>

      <ChatWindow
        messages={messages}
        onHelpfulFeedback={handleHelpfulFeedback}
        onSuggestionClick={handleChipSelect}
      />

      <QuickReplyChips faqList={faqList} onSelect={handleChipSelect} />
      <ChatInput onSend={handleUserQuery} />

      <footer className="app-footer">
        <p>Answers are approximated for this demo &mdash; verify with the Academic Office before acting on them.</p>
      </footer>
    </div>
  )
}

export default App
