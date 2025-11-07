import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface GameModeCardProps {
  mode: string;
  title: string;
  description: string;
  players: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export function GameModeCard({ 
  mode, 
  title, 
  description, 
  players, 
  icon, 
  selected, 
  onSelect 
}: GameModeCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${
        selected 
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
          : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {players}
              </Badge>
            </div>
          </div>
          {selected && (
            <div className="p-1 rounded-full bg-primary">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
