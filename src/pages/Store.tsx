import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Coins, Gem, ArrowLeft, Lock, Check } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useProgression } from '@/hooks/useProgression';

export default function Store() {
  const navigate = useNavigate();
  const { weapons, skins, loading, purchaseItem, isOwned } = useStore();
  const { progression } = useProgression();
  const [selectedTab, setSelectedTab] = useState('weapons');

  const handlePurchase = async (
    itemType: 'weapon' | 'skin',
    itemId: string,
    price: number,
    isPremium: boolean
  ) => {
    const currencyType = isPremium ? 'premium_currency' : 'currency';
    await purchaseItem(itemType, itemId, price, currencyType);
  };

  const canAfford = (price: number, isPremium: boolean) => {
    if (!progression) return false;
    return isPremium
      ? progression.premium_currency >= price
      : progression.currency >= price;
  };

  const canUnlock = (unlockLevel: number) => {
    if (!progression) return false;
    return progression.level >= unlockLevel;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading store...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl font-bold">Store</h1>
            <p className="text-muted-foreground">Purchase weapons, skins, and upgrades</p>
          </div>
          
          {progression && (
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-bold">{progression.currency.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg">
                <Gem className="h-5 w-5 text-purple-500" />
                <span className="font-bold">{progression.premium_currency.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Store Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="weapons">Weapons</TabsTrigger>
            <TabsTrigger value="skins">Skins</TabsTrigger>
          </TabsList>

          {/* Weapons Tab */}
          <TabsContent value="weapons" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weapons.map((weapon) => {
                const owned = isOwned('weapon', weapon.id);
                const canBuy = canAfford(weapon.price, weapon.is_premium) && canUnlock(weapon.unlock_level);
                const locked = !canUnlock(weapon.unlock_level);

                return (
                  <Card key={weapon.id} className={owned ? 'border-green-500' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {weapon.name}
                          {owned && <Check className="h-5 w-5 text-green-500" />}
                          {locked && <Lock className="h-5 w-5 text-muted-foreground" />}
                        </CardTitle>
                        {weapon.is_premium && (
                          <Badge variant="secondary" className="bg-purple-500">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{weapon.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Damage:</span>
                          <span className="font-bold">{weapon.damage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fire Rate:</span>
                          <span className="font-bold">{weapon.fire_rate} RPM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Magazine:</span>
                          <span className="font-bold">{weapon.mag_size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unlock Level:</span>
                          <span className="font-bold">{weapon.unlock_level}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {owned ? (
                        <Button className="w-full" disabled>
                          Owned
                        </Button>
                      ) : locked ? (
                        <Button className="w-full" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          Reach Level {weapon.unlock_level}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handlePurchase('weapon', weapon.id, weapon.price, weapon.is_premium)}
                          disabled={!canBuy}
                        >
                          {weapon.is_premium ? (
                            <Gem className="mr-2 h-4 w-4" />
                          ) : (
                            <Coins className="mr-2 h-4 w-4" />
                          )}
                          Purchase {weapon.price.toLocaleString()}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Skins Tab */}
          <TabsContent value="skins" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skins.map((skin) => {
                const owned = isOwned('skin', skin.id);
                const canBuy = canAfford(skin.price, skin.is_premium) && canUnlock(skin.unlock_level);
                const locked = !canUnlock(skin.unlock_level);

                return (
                  <Card key={skin.id} className={owned ? 'border-green-500' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {skin.name}
                          {owned && <Check className="h-5 w-5 text-green-500" />}
                          {locked && <Lock className="h-5 w-5 text-muted-foreground" />}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getRarityColor(skin.rarity)}>
                            {skin.rarity}
                          </Badge>
                          {skin.is_premium && (
                            <Badge variant="secondary" className="bg-purple-500">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{skin.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-bold capitalize">{skin.skin_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unlock Level:</span>
                          <span className="font-bold">{skin.unlock_level}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {owned ? (
                        <Button className="w-full" disabled>
                          Owned
                        </Button>
                      ) : locked ? (
                        <Button className="w-full" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          Reach Level {skin.unlock_level}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handlePurchase('skin', skin.id, skin.price, skin.is_premium)}
                          disabled={!canBuy}
                        >
                          {skin.is_premium ? (
                            <Gem className="mr-2 h-4 w-4" />
                          ) : (
                            <Coins className="mr-2 h-4 w-4" />
                          )}
                          Purchase {skin.price.toLocaleString()}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
