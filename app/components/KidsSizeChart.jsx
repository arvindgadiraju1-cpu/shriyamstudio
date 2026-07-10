/**
 * Kids size chart component — styled to the Shriyam brand palette.
 * Rendered inline on the product page for all kids' products.
 */

const ROWS = [
  {age: '0 – 6 m', length: 15, chest: 18},
  {age: '6 – 12 m', length: 16, chest: 19},
  {age: '1 – 2 y', length: 17.5, chest: 21},
  {age: '2 – 3 y', length: 19, chest: 22},
  {age: '3 – 4 y', length: 21, chest: 24},
  {age: '4 – 5 y', length: 22, chest: 25},
];

function DressSilhouette() {
  // Technical flat sketch, matching the women's chart style but with child
  // proportions: shorter, wider, cap sleeves, empire waist with gathers.
  // Mirrored around x=70. Arrows map 1:1 to the table columns: Length, Chest.
  return (
    <svg
      viewBox="8 34 102 154"
      width="110"
      height="166"
      aria-hidden="true"
      style={{display: 'block', margin: '0 auto'}}
    >
      {/* Cap sleeves (drawn first so the bodice overlaps the join) */}
      <g fill="#FBF9F6" stroke="#8B6B3E" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M47 45 Q36 49 35 62 Q35 72 40 76 Q48 73 51 66 L51 50 Z" />
        <path d="M93 45 Q104 49 105 62 Q105 72 100 76 Q92 73 89 66 L89 50 Z" />
      </g>

      {/* Bodice + gathered skirt */}
      <path
        d="M60 40 L48 44 C49 54 50 62 51 70 L52 88 C46 110 39 144 36 176 Q70 186 104 176 C101 144 94 110 88 88 L89 70 C90 62 91 54 92 44 L80 40 Q70 50 60 40 Z"
        fill="#FBF9F6"
        stroke="#8B6B3E"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* Empire waist seam + gathers below it */}
      <path d="M52 88 Q70 93 88 88" fill="none" stroke="#8B6B3E" strokeWidth="0.9" />
      <g stroke="#8B6B3E" strokeWidth="0.7" opacity="0.5">
        <line x1="58" y1="92" x2="57" y2="100" />
        <line x1="64" y1="93" x2="63.5" y2="101" />
        <line x1="70" y1="93.5" x2="70" y2="102" />
        <line x1="76" y1="93" x2="76.5" y2="101" />
        <line x1="82" y1="92" x2="83" y2="100" />
      </g>

      {/* Centre-front seam (kept plain — buttons collided with the Chest label) */}
      <path d="M70 50 L70 88" stroke="#C8A96B" strokeWidth="0.7" strokeDasharray="1,3" opacity="0.7" />

      {/* Hem topstitch */}
      <path d="M39 171 Q70 180 101 171" fill="none" stroke="#C8A96B" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.7" />

      {/* Chest */}
      <line x1="53" y1="74" x2="87" y2="74" stroke="#143A34" strokeWidth="1" strokeDasharray="3,2" />
      <polygon points="53,72 53,76 47,74" fill="#143A34" />
      <polygon points="87,72 87,76 93,74" fill="#143A34" />
      <text x="70" y="68" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Chest</text>

      {/* Length */}
      <line x1="24" y1="44" x2="24" y2="179" stroke="#143A34" strokeWidth="1" strokeDasharray="3,2" />
      <polygon points="22,44 26,44 24,38" fill="#143A34" />
      <polygon points="22,179 26,179 24,185" fill="#143A34" />
      <text
        x="15"
        y="112"
        textAnchor="middle"
        fontSize="8"
        fill="#143A34"
        fontFamily="Inter, sans-serif"
        transform="rotate(-90, 15, 112)"
      >
        Length
      </text>
    </svg>
  );
}

export function KidsSizeChart() {
  return (
    <div className="size-chart" aria-label="Kids size guide">
      {/* Header */}
      <div className="size-chart__header">
        <span className="size-chart__eyebrow">Fit Guide</span>
        <h3 className="size-chart__title">Kids Size Chart</h3>
        <p className="size-chart__sub">All measurements in inches</p>
      </div>

      <div className="size-chart__body">
        {/* Diagram */}
        <div className="size-chart__diagram">
          <DressSilhouette />
        </div>

        {/* Table */}
        <div className="size-chart__table-wrap">
          <table className="size-chart__table">
            <thead>
              <tr>
                <th>Age</th>
                <th>Length</th>
                <th>Chest</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.age} className={i % 2 === 0 ? 'size-chart__row--alt' : ''}>
                  <td className="size-chart__size-cell">{row.age}</td>
                  <td>{row.length}</td>
                  <td>{row.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="size-chart__note">
        Sizes are approximate. If your child is between sizes, choose the larger size for room to grow.
      </p>
    </div>
  );
}
