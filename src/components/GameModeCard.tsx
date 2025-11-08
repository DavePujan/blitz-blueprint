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
      className={`cursor-pointer transition-all tactical-border ${
        selected 
          ? 'bg-gradient-to-br from-primary/10 to-background ring-2 ring-primary/40 shadow-[0_0_30px_-10px] shadow-primary/40' 
          : 'hover:bg-accent/40 hover:ring-1 hover:ring-primary/30 hover:shadow-[0_0_20px_-12px] hover:shadow-primary/30'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{title}</CardTitle>
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
        <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
