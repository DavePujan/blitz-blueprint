import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BattlePass {
  id: string;
  season_number: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  max_tier: number;
  is_active: boolean;
}

export interface BattlePassReward {
  id: string;
  battle_pass_id: string;
  tier: number;
  reward_type: 'currency' | 'premium_currency' | 'weapon' | 'skin' | 'xp_boost';
  reward_id: string | null;
  reward_amount: number | null;
  is_premium: boolean;
}

export interface BattlePassProgress {
  id: string;
  player_id: string;
  battle_pass_id: string;
  current_tier: number;
  xp: number;
  is_premium: boolean;
}

export const useBattlePass = () => {
  const [activeBattlePass, setActiveBattlePass] = useState<BattlePass | null>(null);
  const [rewards, setRewards] = useState<BattlePassReward[]>([]);
  const [progress, setProgress] = useState<BattlePassProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBattlePass();
  }, []);

  const fetchBattlePass = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch active battle pass
      const { data: bpData, error: bpError } = await supabase
        .from('battle_pass')
        .select('*')
        .eq('is_active', true)
        .single();

      if (bpError && bpError.code !== 'PGRST116') throw bpError;

      if (bpData) {
        setActiveBattlePass(bpData);

        // Fetch rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('battle_pass_rewards')
          .select('*')
          .eq('battle_pass_id', bpData.id)
          .order('tier');

        if (rewardsError) throw rewardsError;
        setRewards((rewardsData || []) as BattlePassReward[]);

        // Fetch player progress
        if (user) {
          let { data: progressData, error: progressError } = await supabase
            .from('battle_pass_progress')
            .select('*')
            .eq('player_id', user.id)
            .eq('battle_pass_id', bpData.id)
            .maybeSingle();

          if (progressError) throw progressError;
          
          // Auto-create progress if doesn't exist
          if (!progressData) {
            const { data: newProgress, error: insertError } = await supabase
              .from('battle_pass_progress')
              .insert({
                player_id: user.id,
                battle_pass_id: bpData.id,
                current_tier: 1,
                xp: 0,
                is_premium: false
              })
              .select()
              .single();

            if (insertError) throw insertError;
            progressData = newProgress;
          }

          setProgress(progressData);
        }
      }
    } catch (error) {
      console.error('Error fetching battle pass:', error);
      toast({
        title: 'Error',
        description: 'Failed to load battle pass data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addBattlePassXP = async (amount: number) => {
    if (!progress || !activeBattlePass) return;

    const xpPerTier = 1000;
    const newXP = progress.xp + amount;
    const newTier = Math.min(
      Math.floor(newXP / xpPerTier) + 1,
      activeBattlePass.max_tier
    );
    const tierUp = newTier > progress.current_tier;

    try {
      const { data, error } = await supabase
        .from('battle_pass_progress')
        .update({
          xp: newXP,
          current_tier: newTier,
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);

      if (tierUp) {
        toast({
          title: '🎖️ Battle Pass Tier Up!',
          description: `You reached tier ${newTier}!`,
        });
      }
    } catch (error) {
      console.error('Error adding battle pass XP:', error);
    }
  };

  const purchasePremiumPass = async () => {
    if (!progress || progress.is_premium) {
      toast({
        title: 'Already Premium',
        description: 'You already own the premium battle pass',
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Deduct premium currency (e.g., 1000)
      const premiumPassPrice = 1000;

      const { error } = await supabase
        .from('battle_pass_progress')
        .update({ is_premium: true })
        .eq('id', progress.id);

      if (error) throw error;

      // Record purchase
      await supabase.from('store_purchases').insert({
        player_id: user.id,
        item_type: 'battle_pass',
        item_id: progress.battle_pass_id,
        price: premiumPassPrice,
        currency_type: 'premium_currency',
      });

      await fetchBattlePass();

      toast({
        title: 'Premium Pass Activated',
        description: 'You now have access to premium rewards!',
      });

      return true;
    } catch (error) {
      console.error('Error purchasing premium pass:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Not enough premium currency',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getRewardsForTier = (tier: number) => {
    return rewards.filter((r) => r.tier === tier);
  };

  const canClaimReward = (tier: number, isPremium: boolean) => {
    if (!progress) return false;
    if (tier > progress.current_tier) return false;
    if (isPremium && !progress.is_premium) return false;
    return true;
  };

  return {
    activeBattlePass,
    rewards,
    progress,
    loading,
    addBattlePassXP,
    purchasePremiumPass,
    getRewardsForTier,
    canClaimReward,
    refetch: fetchBattlePass,
  };
};
