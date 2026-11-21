import { ChevronLeft, ChevronRight } from 'lucide-react'
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return <div className="pagination"><button disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16}/> Previous</button>
    <span>Page <b>{page}</b> of {pages}</span><button disabled={page >= pages} onClick={() => onChange(page + 1)}>Next <ChevronRight size={16}/></button></div>
}