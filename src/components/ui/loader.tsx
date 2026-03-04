const SuitLoader = () => {
  const suits = [
    { symbol: '♠', name: 'spade' },
    { symbol: '♥', name: 'heart' },
    { symbol: '♣', name: 'club' },
    { symbol: '♦', name: 'diamond' },
  ]

  return (
    <div className="loader-container" aria-label="Loading...">
      {suits.map((suit, index) => (
        <div
          key={index}
          className={`suit suit-${suit.name}`}
          aria-hidden="true"
        >
          {suit.symbol}
        </div>
      ))}
    </div>
  )
}

export default SuitLoader
