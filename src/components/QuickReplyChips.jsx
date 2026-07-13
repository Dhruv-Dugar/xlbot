// Guarantees the demo always has a good answer within reach, even if
// free-text matching misses — Step 7 rationale.
function QuickReplyChips({ faqList, onSelect }) {
  return (
    <div className="chip-bar">
      {faqList.map((faq) => (
        <button key={faq.id} type="button" className="chip" onClick={() => onSelect(faq)}>
          {faq.chip_label}
        </button>
      ))}
    </div>
  )
}

export default QuickReplyChips
