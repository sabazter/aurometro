import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ChevronLeft } from 'lucide-react';

const PointsSection: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/points" className="inline-flex items-center gap-1 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity mb-2">
        <ChevronLeft size={16} /> Volver a selección de año
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{year}° Año</h1>
        <p className="opacity-70">Selecciona la sección</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map(section => (
          <Link key={section} to={`/points/${year}/${section}`}>
            <Card className="text-center hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer py-8">
              <h2 className="text-2xl font-bold">Sección {section}</h2>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PointsSection;
