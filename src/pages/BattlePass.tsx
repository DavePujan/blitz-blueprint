import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Lock, Gift } from 'lucide-react';
import { useBattlePass } from '@/hooks/useBattlePass';
import { useProgression } from '@/hooks/useProgression';

export default function BattlePass() {
  const navigate = useNavigate();
  const { activeBattlePass, progress, loading, purchasePremiumPass, getRewardsForTier, canClaimReward } = useBattlePass();
  const { progression } = useProgression();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading battle pass...</div>
      </div>
    );
  }

  if (!activeBattlePass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Active Battle Pass</CardTitle>
            <CardDescription>There is currently no active battle pass season</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTier = progress?.current_tier || 0;
  const xpPerTier = 1000;
  const currentTierXP = progress ? progress.xp % xpPerTier : 0;
  const xpProgress = (currentTierXP / xpPerTier) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Crown className="h-10 w-10 text-yellow-500" />
                {activeBattlePass.name}
              </h1>
              <p className="text-muted-foreground">{activeBattlePass.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Season {activeBattlePass.season_number} • Ends {new Date(activeBattlePass.end_date).toLocaleDateString()}
              </p>
            </div>
            
            {!progress?.is_premium && (
              <Button
                size="lg"
                onClick={purchasePremiumPass}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium - 1000
              </Button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Progress</CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg">
                  Tier {currentTier} / {activeBattlePass.max_tier}
                </Badge>
                {progress?.is_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Crown className="mr-1 h-4 w-4" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next tier</span>
                <span>{currentTierXP} / {xpPerTier} XP</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Reward Tiers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Rewards</h2>
          
          <div className="grid gap-4">
            {Array.from({ length: activeBattlePass.max_tier }, (_, i) => i + 1).map((tier) => {
              const tierRewards = getRewardsForTier(tier);
              const freeReward = tierRewards.find((r) => !r.is_premium);
              const premiumReward = tierRewards.find((r) => r.is_premium);
              const isUnlocked = tier <= currentTier;

              return (
                <Card key={tier} className={isUnlocked ? 'border-green-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        Tier {tier}
                        {!isUnlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                      </CardTitle>
                      {tier === currentTier && (
                        <Badge>Current Tier</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Free Reward */}
                      <div className={`p-4 rounded-lg border ${isUnlocked ? 'bg-green-500/10 border-green-500' : 'bg-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-4 w-4" />
                          <span className="font-semibold">Free</span>
                        </div>
                        {freeReward ? (
                          <div className="text-sm">
                            <p className="capitalize">{freeReward.reward_type}</p>
                            {freeReward.reward_amount && (
                              <p className="text-muted-foreground">Amount: {freeReward.reward_amount}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No reward</p>
                        )}
                      </div>

                      {/* Premium Reward */}
                      <div className={`p-4 rounded-lg border ${
                        isUnlocked && progress?.is_premium
                          ? 'bg-yellow-500/10 border-yellow-500'
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">Premium</span>
                        </div>
                        {premiumReward ? (
                          <div className="text-sm">
                            <p className="capitalize">{premiumReward.reward_type}</p>
                            {premiumReward.reward_amount && (
                              <p className="text-muted-foreground">Amount: {premiumReward.reward_amount}</p>
                            )}
                            {!progress?.is_premium && (
                              <Badge variant="outline" className="mt-2">
                                <Lock className="mr-1 h-3 w-3" />
                                Premium Only
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No reward</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
