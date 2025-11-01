import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Target, Crosshair, Shield, TrendingUp, Award } from 'lucide-react';
import { useProgression } from '@/hooks/useProgression';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progression, loading } = useProgression();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!progression) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load profile data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const xpPerLevel = 1000;
  const currentLevelXP = progression.xp % xpPerLevel;
  const levelProgress = (currentLevelXP / xpPerLevel) * 100;
  const kd = progression.total_deaths > 0
    ? (progression.total_kills / progression.total_deaths).toFixed(2)
    : progression.total_kills.toFixed(2);
  const winRate = progression.total_matches > 0
    ? ((progression.wins / progression.total_matches) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">{user?.email?.split('@')[0] || 'Player'}</h1>
              <p className="text-muted-foreground">Player Profile & Statistics</p>
            </div>
            <Badge className="text-lg px-4 py-2">
              <Award className="mr-2 h-5 w-5" />
              Level {progression.level}
            </Badge>
          </div>
        </div>

        {/* Level Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
            <CardDescription>Experience to next level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {progression.level}</span>
                <span>{currentLevelXP} / {xpPerLevel} XP</span>
                <span>Level {progression.level + 1}</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Kills</CardTitle>
              <Crosshair className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progression.total_kills.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">K/D Ratio</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kd}</div>
              <p className="text-xs text-muted-foreground">
                {progression.total_deaths} deaths
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{winRate}%</div>
              <p className="text-xs text-muted-foreground">
                {progression.wins} / {progression.total_matches} matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progression.total_matches.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progression.wins.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Currency</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progression.currency.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {progression.premium_currency} premium
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/store')}>
              Visit Store
            </Button>
            <Button onClick={() => navigate('/battle-pass')} variant="outline">
              Battle Pass
            </Button>
            <Button onClick={() => navigate('/lobby')} variant="outline">
              Find Match
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
