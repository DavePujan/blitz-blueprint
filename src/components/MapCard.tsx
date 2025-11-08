import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, MapPin } from 'lucide-react';

interface MapCardProps {
  mapId: string;
  name: string;
  description: string;
  size: string;
  selected: boolean;
  onSelect: () => void;
}

export function MapCard({ 
  mapId, 
  name, 
  description, 
  size, 
  selected, 
  onSelect 
}: MapCardProps) {
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
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">{name}</CardTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                {size}
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
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
