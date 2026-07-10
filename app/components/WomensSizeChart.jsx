/**
 * Womens size chart component — styled to the Shriyam brand palette.
 * Rendered inline on the product page for all women's products.
 */

const ROWS = [
  {size: 'XS', chest: 32, waist: 26, shoulder: 14, hip: 36},
  {size: 'S', chest: 34, waist: 28, shoulder: 14.5, hip: 38},
  {size: 'M', chest: 36, waist: 30, shoulder: 15, hip: 40},
  {size: 'L', chest: 38, waist: 32, shoulder: 15.5, hip: 42},
  {size: 'XL', chest: 40, waist: 34, shoulder: 16, hip: 44},
  {size: 'XXL', chest: 42, waist: 36, shoulder: 16.5, hip: 46},
];

function WomensSilhouette() {
  // Technical flat sketch — the symmetric spec-sheet style used on garment
  // measurement guides. Every x-coordinate mirrors around the centre (x=80)
  // so the drawing stays clean at small sizes. Arrows map 1:1 to the table
  // columns: Shoulder, Chest, Waist, Hip.
  return (
    <svg
      viewBox="30 19 100 214"
      width="130"
      height="278"
      aria-hidden="true"
      style={{display: 'block', margin: '0 auto'}}
    >
      {/* Sleeves (drawn first so the body overlaps the join) */}
      <g fill="#FBF9F6" stroke="#8B6B3E" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M54 42 C46 46 41 52 39 60 L33 100 Q33 104 37 104 L47 104 Q50 104 51 100 L57 68 C57 58 56 48 54 42 Z" />
        <path d="M106 42 C114 46 119 52 121 60 L127 100 Q127 104 123 104 L113 104 Q110 104 109 100 L103 68 C103 58 104 48 106 42 Z" />
      </g>

      {/* Body — round neck, gentle A-line to the hem */}
      <path
        d="M66 38 L54 42 C56 52 57 62 58 70 C59 82 59.5 94 60 104 C56 140 49 182 45 222 Q80 230 115 222 C111 182 104 140 100 104 C100.5 94 101 82 102 70 C103 62 104 52 106 42 L94 38 Q80 54 66 38 Z"
        fill="#FBF9F6"
        stroke="#8B6B3E"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* Centre-front seam */}
      <path d="M80 56 L80 220" stroke="#C8A96B" strokeWidth="0.7" strokeDasharray="1,3" opacity="0.7" />

      {/* Shoulder */}
      <line x1="50" y1="42" x2="110" y2="42" stroke="#143A34" strokeWidth="1" strokeDasharray="3,2" />
      <polygon points="50,40 50,44 44,42" fill="#143A34" />
      <polygon points="110,40 110,44 116,42" fill="#143A34" />
      <text x="80" y="30" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Shoulder</text>

      {/* Chest */}
      <line x1="60" y1="88" x2="100" y2="88" stroke="#143A34" strokeWidth="1" strokeDasharray="3,2" />
      <polygon points="60,86 60,90 54,88" fill="#143A34" />
      <polygon points="100,86 100,90 106,88" fill="#143A34" />
      <text x="80" y="83" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Chest</text>

      {/* Waist */}
      <line x1="61" y1="106" x2="99" y2="106" stroke="#143A34" strokeWidth="1" strokeDasharray="3,2" />
      <polygon points="61,104 61,108 55,106" fill="#143A34" />
      <polygon points="99,104 99,108 105,106" fill="#143A34" />
      <text x="80" y="101" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Waist</text>

      {/* Hip */}
      <line x1="55" y1="150" x2="105" y2="150" stroke="#143A34" strokeWidth="1" strokeDasharray="3,2" />
      <polygon points="55,148 55,152 49,150" fill="#143A34" />
      <polygon points="105,148 105,152 111,150" fill="#143A34" />
      <text x="80" y="145" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Hip</text>
    </svg>
  );
}

export function WomensSizeChart() {
  return (
    <div className="size-chart" aria-label="Women's size guide">
      {/* Header */}
      <div className="size-chart__header">
        <span className="size-chart__eyebrow">Fit Guide</span>
        <h3 className="size-chart__title">Women&#39;s Size Chart</h3>
        <p className="size-chart__sub">All measurements in inches</p>
      </div>

      <div className="size-chart__body">
        {/* Diagram */}
        <div className="size-chart__diagram">
          <WomensSilhouette />
        </div>

        {/* Table */}
        <div className="size-chart__table-wrap">
          <table className="size-chart__table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Waist</th>
                <th>Shoulder</th>
                <th>Hip</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? 'size-chart__row--alt' : ''}>
                  <td className="size-chart__size-cell">{row.size}</td>
                  <td>{row.chest}</td>
                  <td>{row.waist}</td>
                  <td>{row.shoulder}</td>
                  <td>{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="size-chart__note">
        Measure over the fullest part. When between sizes, size up.
      </p>
    </div>
  );
}
