import "./splash-screen.css";

/**
 * Launch splash: pure CSS so it paints before any JavaScript, plays once per app session, then hides itself.
 * The inline script runs during HTML parsing and skips the splash on later page loads in the same session.
 */
const SKIP_REPEAT = `try{var k="abhyas-splash";if(sessionStorage.getItem(k))document.documentElement.setAttribute("data-splash","seen");else sessionStorage.setItem(k,"1")}catch(e){}`;

export function SplashScreen() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_REPEAT }} />
      <div className="splash" aria-hidden="true">
        <span className="splash-orb splash-orb-a" />
        <span className="splash-orb splash-orb-b" />
        <span className="splash-orb splash-orb-c" />
        <div className="splash-stage">
          <svg className="splash-mark" viewBox="0 0 72 72" width="112" height="112">
            <defs>
              {/* The sun is clipped above the book's top edge, so it rises out from behind the pages. */}
              <clipPath id="splash-sky"><rect width="72" height="46" /></clipPath>
              <linearGradient id="splash-tile-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#16392F" /><stop offset="1" stopColor="#0B1F17" /></linearGradient>
              <linearGradient id="splash-sun-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD766" /><stop offset="1" stopColor="#FFA81D" /></linearGradient>
              <radialGradient id="splash-sun-glow"><stop offset="0" stopColor="#FFB61D" stopOpacity=".6" /><stop offset="1" stopColor="#FFB61D" stopOpacity="0" /></radialGradient>
            </defs>
            <rect className="splash-tile" width="72" height="72" rx="20" fill="url(#splash-tile-fill)" />
            <g clipPath="url(#splash-sky)">
              <circle className="splash-glow" cx="36" cy="32" r="22" fill="url(#splash-sun-glow)" />
              <circle className="splash-sun" cx="36" cy="32" r="10" fill="url(#splash-sun-fill)" />
            </g>
            <path className="splash-page splash-page-l" d="M10 45c9-6 19-6 26 0v13c-7-5-17-5-26 0z" fill="#64FCD9" />
            <path className="splash-page splash-page-r" d="M62 45c-9-6-19-6-26 0v13c7-5 17-5 26 0z" fill="#3EE0BC" />
          </svg>
          <p className="splash-word">
            {"abhyas".split("").map((ch, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties}>{ch}</span>
            ))}
            <span className="splash-dot">.</span>
          </p>
          <p className="splash-tag">CMA Intermediate · Daily practice</p>
        </div>
      </div>
    </>
  );
}
