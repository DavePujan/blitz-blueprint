import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeaponItem {
  id: string;
  weapon_type: string;
  name: string;
  description: string | null;
  damage: number;
  fire_rate: number;
  mag_size: number;
  reload_time: number;
  unlock_level: number;
  price: number;
  is_premium: boolean;
}

export interface SkinItem {
  id: string;
  name: string;
  description: string | null;
  skin_type: 'weapon' | 'character';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  is_premium: boolean;
  unlock_level: number;
  image_url: string | null;
}

export interface InventoryItem {
  id: string;
  player_id: string;
  item_type: 'weapon' | 'skin';
  item_id: string;
  equipped: boolean;
  purchased_at: string;
}

export const useStore = () => {
  const [weapons, setWeapons] = useState<WeaponItem[]>([]);
  const [skins, setSkins] = useState<SkinItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStore();
    fetchInventory();
  }, []);

  const fetchStore = async () => {
    try {
      const [weaponsRes, skinsRes] = await Promise.all([
        supabase.from('weapons_catalog').select('*').order('unlock_level'),
        supabase.from('skins_catalog').select('*').order('rarity'),
      ]);

      if (weaponsRes.error) throw weaponsRes.error;
      if (skinsRes.error) throw skinsRes.error;

      setWeapons((weaponsRes.data || []) as WeaponItem[]);
      setSkins((skinsRes.data || []) as SkinItem[]);
    } catch (error) {
      console.error('Error fetching store:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('player_id', user.id);

      if (error) throw error;
      setInventory((data || []) as InventoryItem[]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const purchaseItem = async (
    itemType: 'weapon' | 'skin',
    itemId: string,
    price: number,
    currencyType: 'currency' | 'premium_currency'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already owned
      const owned = inventory.some(
        (item) => item.item_type === itemType && item.item_id === itemId
      );
      if (owned) {
        toast({
          title: 'Already Owned',
          description: 'You already own this item',
          variant: 'destructive',
        });
        return false;
      }

      // Add to inventory
      const { error: invError } = await supabase
        .from('player_inventory')
        .insert({
          player_id: user.id,
          item_type: itemType,
          item_id: itemId,
        });

      if (invError) throw invError;

      // Record purchase
      const { error: purchaseError } = await supabase
        .from('store_purchases')
        .insert({
          player_id: user.id,
          item_type: itemType,
          item_id: itemId,
          price,
          currency_type: currencyType,
        });

      if (purchaseError) throw purchaseError;

      // Update progression currency (deduct)
      const field = currencyType === 'premium_currency' ? 'premium_currency' : 'currency';
      const { data: progressionData, error: progressionError } = await supabase
        .from('player_progression')
        .select(field)
        .eq('player_id', user.id)
        .maybeSingle();

      if (progressionError) throw progressionError;

      if (progressionData) {
        const currentAmount = progressionData[field];
        if (currentAmount < price) {
          throw new Error('Insufficient currency');
        }

        await supabase
          .from('player_progression')
          .update({ [field]: currentAmount - price })
          .eq('player_id', user.id);
      } else {
        throw new Error('Player progression not initialized');
      }

      await fetchInventory();

      toast({
        title: 'Purchase Successful',
        description: 'Item added to your inventory',
      });

      return true;
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Not enough currency or an error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const equipItem = async (inventoryItemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const item = inventory.find((i) => i.id === inventoryItemId);
      if (!item) return;

      // Unequip all items of same type
      await supabase
        .from('player_inventory')
        .update({ equipped: false })
        .eq('player_id', user.id)
        .eq('item_type', item.item_type);

      // Equip selected item
      const { error } = await supabase
        .from('player_inventory')
        .update({ equipped: true })
        .eq('id', inventoryItemId);

      if (error) throw error;

      await fetchInventory();

      toast({
        title: 'Item Equipped',
        description: 'Item has been equipped',
      });
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const isOwned = (itemType: 'weapon' | 'skin', itemId: string) => {
    return inventory.some(
      (item) => item.item_type === itemType && item.item_id === itemId
    );
  };

  return {
    weapons,
    skins,
    inventory,
    loading,
    purchaseItem,
    equipItem,
    isOwned,
    refetch: () => {
      fetchStore();
      fetchInventory();
    },
  };
};
