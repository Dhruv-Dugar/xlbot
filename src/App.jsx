import './App.css'
import prometheusLogo from './assets/prometheus-icon.png'
import xlriLogo from './assets/xlri-logo.png'
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
        <div className="app-header-logos">
          <img src={xlriLogo} alt="XLRI logo" />
          <img src={prometheusLogo} alt="Prometheus logo" />
        </div>
        <div className="app-header-text">
          <h1>{botConfig.bot_name}</h1>
          <p className="app-subtitle">Prometheus Product Vertical &mdash; Academic FAQ Assistant (MVP)</p>
        </div>
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
        <p>
          This same FAQ-bot pattern could extend to pre-admission queries and be handed to ExLink to help onboard
          incoming students.
        </p>
        <p className="app-footer-credit">Made by Dhruv Dugar | B26080</p>
      </footer>
    </div>
  )
}

export default App
