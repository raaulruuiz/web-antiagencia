// Shared card metadata used in both admin and public biblioteca grids.
import { useTheme } from '@/lib/ThemeContext';

const CAT_TEXT = {
  dark:  { email: '#93c5fd', ficha: '#d8b4fe' },
  light: { email: '#1d4ed8', ficha: '#7e22ce' },
};
const SUBCAT_TEXT = {
  dark:  { automatizacion: '#86efac', campana: '#fdba74' },
  light: { automatizacion: '#15803d', campana: '#c2410c' },
};

export default function BibliotecaCardMeta({ item, allTags = [] }) {
  const { theme } = useTheme();
  const resolvedTags = (item.tags || []).map(id => allTags.find(t => t.id === id)).filter(Boolean);

  return (
    <div style={{ marginTop: 4 }}>
      {item.marca ? (
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--t-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.marca}
        </p>
      ) : (
        <p style={{ fontSize: 11, color: 'var(--t-text-subtle)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}
      {(item.categoria === 'email' ? item.asunto : item.ficha_url) && (
        <p style={{ fontSize: 12, color: 'var(--t-text-subtle)', margin: '2px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.categoria === 'email' ? item.asunto : item.ficha_url}
        </p>
      )}
      {(item.categoria || item.subcategoria || resolvedTags.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
          {item.categoria && (
            <span style={{
              fontSize: 10, borderRadius: 999, padding: '1px 7px', fontWeight: 500,
              background: item.categoria === 'email' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)',
              border: `1px solid ${item.categoria === 'email' ? '#3b82f6' : '#a855f7'}`,
              color: CAT_TEXT[theme]?.[item.categoria] || CAT_TEXT.dark[item.categoria],
            }}>
              {item.categoria === 'email' ? 'Email' : 'Ficha'}
            </span>
          )}
          {item.subcategoria && (
            <span style={{
              fontSize: 10, borderRadius: 999, padding: '1px 7px', fontWeight: 500,
              background: item.subcategoria === 'automatizacion' ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)',
              border: `1px solid ${item.subcategoria === 'automatizacion' ? '#22c55e' : '#f97316'}`,
              color: SUBCAT_TEXT[theme]?.[item.subcategoria] || SUBCAT_TEXT.dark[item.subcategoria],
            }}>
              {item.subcategoria === 'automatizacion' ? 'Automatización' : 'Campaña'}
            </span>
          )}
          {resolvedTags.map(tag => (
            <span key={tag.id} style={{
              fontSize: 10, borderRadius: 999, padding: '1px 7px', fontWeight: 500,
              background: tag.color + '22',
              border: `1px solid ${tag.color}`,
              color: tag.color,
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
