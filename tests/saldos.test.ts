import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularSaldos } from '../utils/saldos';
test('incluye el saldo anterior a la ventana y conserva dias sin movimientos', () => {
 const datos = calcularSaldos([
  { fechaCreacion: new Date('2026-08-01T15:00:00Z'), tipo: 'ENTRADA', cantidad: 12 },
  { fechaCreacion: new Date('2026-10-29T15:00:00Z'), tipo: 'SALIDA', cantidad: 4 },
 ], new Date('2026-10-30T18:00:00Z'));
 assert.equal(datos.length, 30); assert.equal(datos[0].saldo, 12);
 assert.deepEqual(datos.at(-1), { fecha: '2026-10-30', saldo: 8 });
});
test('agrupa segun el dia de Colombia aunque cambie la fecha UTC', () => {
 const datos = calcularSaldos([
  { fechaCreacion: new Date('2026-10-30T04:30:00Z'), tipo: 'ENTRADA', cantidad: 3 },
  { fechaCreacion: new Date('2026-10-30T05:30:00Z'), tipo: 'SALIDA', cantidad: 1 },
 ], new Date('2026-10-30T18:00:00Z'));
 assert.deepEqual(datos, [{ fecha: '2026-10-29', saldo: 3 }, { fecha: '2026-10-30', saldo: 2 }]);
});
test('sin movimientos no inventa datos', () => { assert.deepEqual(calcularSaldos([]), []); });
