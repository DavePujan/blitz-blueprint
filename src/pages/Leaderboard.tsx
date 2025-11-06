import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { leaderboard, userRank, loading } = useLeaderboard('current');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return null;
  };

  const getRankBadgeVariant = (rank: number): "default" | "secondary" | "destructive" | "outline" => {
    if (rank <= 10) return "default";
    if (rank <= 50) return "secondary";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-muted-foreground">Compete for the top spot</p>
          </div>
        </div>

        {userRank && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(userRank.rank)}
                    <span className="text-3xl font-bold">#{userRank.rank}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{userRank.profile?.username}</p>
                    <p className="text-sm text-muted-foreground">{userRank.total_score.toLocaleString()} points</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">K/D</p>
                    <p className="font-bold">{userRank.kd_ratio.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="font-bold">{userRank.win_rate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kills</p>
                    <p className="font-bold">{userRank.total_kills}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 100 Players</CardTitle>
                <CardDescription>Current season rankings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  ))
                ) : (
                  leaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 w-16">
                          {getRankIcon(entry.rank)}
                          <Badge variant={getRankBadgeVariant(entry.rank)}>
                            #{entry.rank}
                          </Badge>
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.profile?.avatar_url} />
                          <AvatarFallback>{entry.profile?.username?.[0] || 'P'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.profile?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.total_score.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">K/D</p>
                          <p className="font-bold">{entry.kd_ratio.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="font-bold">{entry.win_rate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Kills</p>
                          <p className="font-bold">{entry.total_kills}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Weekly leaderboard coming soon...
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Monthly leaderboard coming soon...
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
