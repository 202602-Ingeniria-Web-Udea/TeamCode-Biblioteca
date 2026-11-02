import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
const index = ({
  columnas,
  filas,
  mensaje,
}: {
  columnas: string[];
  filas: React.ReactNode[][];
  mensaje: string;
}) => (
  <div className="tabla-contenedor">
    {filas.length ? (
      <Table>
        <TableHeader>
          <TableRow>
            {columnas.map((columna) => (
              <TableHead key={columna}>{columna}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((fila, posicion) => (
            <TableRow key={posicion}>
              {fila.map((valor, numero) => (
                <TableCell key={numero}>{valor}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <p className="vacio">{mensaje}</p>
    )}
  </div>
);
export default index;
