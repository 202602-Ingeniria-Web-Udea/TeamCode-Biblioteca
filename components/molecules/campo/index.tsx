import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const index = ({ nombre, titulo, tipo, ejemplo }: { nombre: string; titulo: string; tipo: 'email' | 'password'; ejemplo: string }) => <div className="campo"><Label htmlFor={nombre}>{titulo}</Label><Input id={nombre} name={nombre} type={tipo} placeholder={ejemplo} required maxLength={tipo === 'password' ? 128 : 254} autoComplete={tipo === 'password' ? 'current-password' : 'username'} /></div>;
export default index;
