/**
 * Womens size chart component — styled to the Shriyam Studio brand palette.
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

function KurtaSilhouette() {
  return (
    <svg
      viewBox="0 0 160 260"
      width="120"
      height="200"
      aria-hidden="true"
      style={{display: 'block', margin: '0 auto'}}
    >
      {/* Kurta body shape */}
      <g fill="#E8DFD0" stroke="#C8A96B" strokeWidth="1.2">
        {/* Neckline + shoulders */}
        <path d="M60 30 Q80 22 100 30 L112 55 Q100 50 80 50 Q60 50 48 55 Z" />
        {/* Sleeves */}
        <path d="M48 55 Q30 65 24 90 L38 92 Q44 72 52 68 L48 55Z" />
        <path d="M112 55 Q130 65 136 90 L122 92 Q116 72 108 68 L112 55Z" />
        {/* Main body — kurta */}
        <path d="M52 68 L46 200 Q60 208 80 208 Q100 208 114 200 L108 68 Q100 50 80 50 Q60 50 52 68Z" />
      </g>

      {/* Chest measurement arrow */}
      <line x1="54" y1="90" x2="106" y2="90" stroke="#143A34" strokeWidth="1.2" strokeDasharray="3,2" />
      <polygon points="54,88 54,92 47,90" fill="#143A34" />
      <polygon points="106,88 106,92 113,90" fill="#143A34" />
      <text x="80" y="85" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Chest</text>

      {/* Waist measurement arrow */}
      <line x1="56" y1="130" x2="104" y2="130" stroke="#143A34" strokeWidth="1.2" strokeDasharray="3,2" />
      <polygon points="56,128 56,132 49,130" fill="#143A34" />
      <polygon points="104,128 104,132 111,130" fill="#143A34" />
      <text x="80" y="125" textAnchor="middle" fontSize="8" fill="#143A34" fontFamily="Inter, sans-serif">Waist</text>

      {/* Shoulder measurement arrow */}
      <line x1="52" y1="57" x2="108" y2="57" stroke="#8B6B3E" strokeWidth="1" strokeDasharray="2,2" />
      <polygon points="52,55 52,59 45,57" fill="#8B6B3E" />
      <polygon points="108,55 108,59 115,57" fill="#8B6B3E" />
      <text x="80" y="53" textAnchor="middle" fontSize="7.5" fill="#8B6B3E" fontFamily="Inter, sans-serif">Shoulder</text>

      {/* Length arrow on the side */}
      <line x1="36" y1="50" x2="36" y2="205" stroke="#143A34" strokeWidth="1.2" strokeDasharray="3,2" />
      <polygon points="34,50 38,50 36,43" fill="#143A34" />
      <polygon points="34,205 38,205 36,212" fill="#143A34" />
      <text
        x="26"
        y="130"
        textAnchor="middle"
        fontSize="8"
        fill="#143A34"
        fontFamily="Inter, sans-serif"
        transform="rotate(-90, 26, 130)"
      >
        Length
      </text>
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
          <KurtaSilhouette />
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
