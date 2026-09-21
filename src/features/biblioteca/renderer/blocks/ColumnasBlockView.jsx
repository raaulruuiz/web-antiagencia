import { BlockRenderer } from '../BlockRenderer';

// Layout de columnas compartido — la ÚNICA fuente de verdad para grid/número de
// columnas/anchos/gaps/responsive de un bloque "columnas". Tanto el renderer
// público (vía ColumnasBlockView) como el editor admin (BibliotecaItem.jsx)
// consumen este mismo componente para el contenedor; cada uno decide QUÉ
// renderizar dentro de cada celda vía `renderItem` (público: BlockRenderer de
// solo lectura; admin: BlockCard editable), y admin puede añadir chrome extra
// por columna (borde, fondo, botón "+ bloque") vía `columnWrapperStyle` /
// `renderAfterColumn` sin tocar el grid ni los gaps compartidos.
export function ColumnasLayout({ block, isMobile, renderItem, columnWrapperStyle, renderAfterColumn }) {
  const numCols = block.num_columnas || 2;
  const columns = block.columns || [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${numCols}, 1fr)`, gap: 12 }}>
      {Array.from({ length: numCols }, (_, ci) => {
        const col = columns[ci] || [];
        return (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 10, ...(columnWrapperStyle ? columnWrapperStyle(ci) : null) }}>
            {col.map((nb, bi) => renderItem(nb, bi, ci))}
            {renderAfterColumn ? renderAfterColumn(ci) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ColumnasBlockView({ block, onPreview, theme, isMobile, item }) {
  const columns = block.columns || [];
  const hasContent = columns.some(col => Array.isArray(col) && col.length > 0);
  if (!hasContent) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
      <ColumnasLayout
        block={block}
        isMobile={isMobile}
        renderItem={(nb, bi) => (
          <BlockRenderer key={nb.id || bi} block={nb} onPreview={onPreview} theme={theme} isMobile={isMobile} item={item} />
        )}
      />
    </div>
  );
}
