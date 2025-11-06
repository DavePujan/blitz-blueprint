import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAchievements } from '@/hooks/useAchievements';
import { Skeleton } from '@/components/ui/skeleton';

export default function Achievements() {
  const navigate = useNavigate();
  const { achievements, playerAchievements, loading } = useAchievements();

  const getPlayerAchievement = (achievementId: string) => {
    return playerAchievements.find((pa) => pa.achievement_id === achievementId);
  };

  const getProgressPercentage = (achievementId: string) => {
    const playerAchievement = getPlayerAchievement(achievementId);
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!playerAchievement || !achievement) return 0;
    return (playerAchievement.progress / achievement.requirement_value) * 100;
  };

  const categories = [...new Set(achievements.map((a) => a.category))];
  const completedCount = playerAchievements.filter((pa) => pa.is_completed).length;
  const totalPoints = playerAchievements
    .filter((pa) => pa.is_completed)
    .reduce((sum, pa) => {
      const achievement = achievements.find((a) => a.id === pa.achievement_id);
      return sum + (achievement?.points || 0);
    }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Achievements
            </h1>
            <p className="text-muted-foreground">Track your progress and unlock rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">
                out of {achievements.length} achievements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints}</div>
              <p className="text-xs text-muted-foreground">achievement points earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {achievements.length > 0 ? ((completedCount / achievements.length) * 100).toFixed(1) : 0}%
              </div>
              <Progress
                value={achievements.length > 0 ? (completedCount / achievements.length) * 100 : 0}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              categories.map((category) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-xl font-semibold capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements
                      .filter((a) => a.category === category)
                      .map((achievement) => {
                        const playerAchievement = getPlayerAchievement(achievement.id);
                        const isCompleted = playerAchievement?.is_completed;
                        const progress = getProgressPercentage(achievement.id);

                        return (
                          <Card
                            key={achievement.id}
                            className={
                              isCompleted
                                ? 'border-primary/50 bg-gradient-to-r from-primary/5 to-transparent'
                                : ''
                            }
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="flex items-center gap-2">
                                    {achievement.name}
                                    {isCompleted && <Trophy className="h-4 w-4 text-primary" />}
                                    {achievement.is_secret && !isCompleted && (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </CardTitle>
                                  <CardDescription>
                                    {achievement.is_secret && !isCompleted
                                      ? 'Secret achievement'
                                      : achievement.description}
                                  </CardDescription>
                                </div>
                                <Badge variant={isCompleted ? 'default' : 'outline'}>
                                  {achievement.points} pts
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {!isCompleted && playerAchievement && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">
                                      {playerAchievement.progress} / {achievement.requirement_value}
                                    </span>
                                  </div>
                                  <Progress value={progress} />
                                </div>
                              )}
                              {isCompleted && playerAchievement && (
                                <p className="text-sm text-muted-foreground">
                                  Unlocked{' '}
                                  {new Date(playerAchievement.unlocked_at).toLocaleDateString()}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements
                .filter((a) => getPlayerAchievement(a.id)?.is_completed)
                .map((achievement) => {
                  const playerAchievement = getPlayerAchievement(achievement.id);
                  return (
                    <Card
                      key={achievement.id}
                      className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {achievement.name}
                          <Trophy className="h-4 w-4 text-primary" />
                        </CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <Badge variant="default">{achievement.points} pts</Badge>
                          {playerAchievement && (
                            <p className="text-sm text-muted-foreground">
                              {new Date(playerAchievement.unlocked_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements
                .filter(
                  (a) => getPlayerAchievement(a.id) && !getPlayerAchievement(a.id)?.is_completed
                )
                .map((achievement) => {
                  const playerAchievement = getPlayerAchievement(achievement.id);
                  const progress = getProgressPercentage(achievement.id);
                  return (
                    <Card key={achievement.id}>
                      <CardHeader>
                        <CardTitle>{achievement.name}</CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {playerAchievement?.progress} / {achievement.requirement_value}
                          </span>
                        </div>
                        <Progress value={progress} />
                        <Badge variant="outline" className="mt-2">
                          {achievement.points} pts
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="locked">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements
                .filter((a) => !getPlayerAchievement(a.id))
                .map((achievement) => (
                  <Card key={achievement.id} className="opacity-75">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {achievement.is_secret ? 'Secret Achievement' : achievement.name}
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>
                        {achievement.is_secret ? '???' : achievement.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">{achievement.points} pts</Badge>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
