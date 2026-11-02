'use client';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
const index = ({ libros, seleccionado }: { libros: { id: string; titulo: string }[]; seleccionado: string }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const router = useRouter();
  return <div className="campo selector"><Label htmlFor="libro-seleccionado">Libro que quieres consultar</Label><Select value={seleccionado} onValueChange={valor => router.push('/movimientos?libro=' + valor)}><SelectTrigger id="libro-seleccionado" className="control"><SelectValue /></SelectTrigger><SelectContent>{libros.map(libro => <SelectItem key={libro.id} value={libro.id}>{libro.titulo}</SelectItem>)}</SelectContent></Select></div>;
};
export default index;
