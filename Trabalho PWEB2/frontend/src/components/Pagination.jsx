export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button className="btn secondary" disabled={page <= 1} onClick={onPrev}>Anterior</button>
      <span>Página {page} de {totalPages || 1}</span>
      <button className="btn secondary" disabled={page >= totalPages} onClick={onNext}>Próxima</button>
    </div>
  )
}
