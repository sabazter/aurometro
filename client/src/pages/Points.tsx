import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ChevronLeft } from 'lucide-react';

const Points: React.FC = () => {
  const years = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity mb-2">
        <ChevronLeft size={16} /> Volver al inicio
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Selección de Año</h1>
        <p className="opacity-70">Elige el año académico para continuar</p>
      </div>

      <div className="grid gap-4">
        {years.map(year => (
          <Link key={year} to={`/points/${year}`}>
            <Card className="text-center hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer py-6">
              <h2 className="text-2xl font-bold">{year === 1 ? '1er' : year === 2 ? '2do' : year === 3 ? '3er' : `${year}to`} Año</h2>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Points;
