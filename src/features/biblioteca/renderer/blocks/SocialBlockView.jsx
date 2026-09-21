import { SocialIcon } from '../shared/SocialIcon';

export function SocialBlockView({ block }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {block.titulo && <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t-text)', margin: 0 }}>{block.titulo}</h3>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(block.socials || []).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {s.url
              ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', textDecoration: 'none', flexShrink: 0 }}>
                  <SocialIcon network={s.network} color={s.color} size={22} />
                </a>
              : <SocialIcon network={s.network} color={s.color} size={22} />
            }
            <span style={{ fontSize: 26, color: s.color, fontWeight: 300, flexShrink: 0 }}>→</span>
            {s.url
              ? <a href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 14, color: s.color, textDecoration: 'none', wordBreak: 'break-all' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  {s.url}
                </a>
              : <span style={{ fontSize: 14, color: 'var(--t-text-faint)', fontStyle: 'italic' }}>Vacío</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
