import Link from 'next/link';
import { BookOpen } from 'lucide-react';
const index = () => <Link href="/" className="marca"><span className="marca-icono"><BookOpen size={24} /></span><span>Biblioteca<span className="marca-punto">.</span></span></Link>;
export default index;
