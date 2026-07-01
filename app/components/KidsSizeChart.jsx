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
  return (
    <svg
      viewBox="0 0 140 230"
      width="100"
      height="180"
      aria-hidden="true"
      style={{display: 'block', margin: '0 auto'}}
    >
      {/* Dress body */}
      <g fill="#E8DFD0" stroke="#C8A96B" strokeWidth="1.2">
        {/* Bodice */}
        <path d="M55 30 Q70 22 85 30 L94 55 Q82 50 70 50 Q58 50 46 55 Z" />
        {/* Sleeves */}
        <path d="M46 55 Q32 64 28 82 L40 84 Q44 68 50 64 L46 55Z" />
        <path d="M94 55 Q108 64 112 82 L100 84 Q96 68 90 64 L94 55Z" />
        {/* Skirt — flared */}
        <path d="M50 64 Q58 50 70 50 Q82 50 90 64 L104 200 Q86 210 70 210 Q54 210 36 200 Z" />
      </g>

      {/* Chest arrow */}
      <line x1="52" y1="78" x2="88" y2="78" stroke="#143A34" strokeWidth="1.2" strokeDasharray="3,2" />
      <polygon points="52,76 52,80 45,78" fill="#143A34" />
      <polygon points="88,76 88,80 95,78" fill="#143A34" />
      <text x="70" y="73" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Chest</text>

      {/* Length arrow */}
      <line x1="30" y1="50" x2="30" y2="205" stroke="#143A34" strokeWidth="1.2" strokeDasharray="3,2" />
      <polygon points="28,50 32,50 30,43" fill="#143A34" />
      <polygon points="28,205 32,205 30,212" fill="#143A34" />
      <text
        x="20"
        y="130"
        textAnchor="middle"
        fontSize="8"
        fill="#143A34"
        fontFamily="Inter, sans-serif"
        transform="rotate(-90, 20, 130)"
      >
        Length
      </text>

      {/* Gold dots at neckline — decorative */}
      <circle cx="70" cy="32" r="3" fill="#C8A96B" opacity="0.7" />
      <circle cx="63" cy="35" r="2" fill="#C8A96B" opacity="0.5" />
      <circle cx="77" cy="35" r="2" fill="#C8A96B" opacity="0.5" />
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
