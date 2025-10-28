import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { PlayerSnapshot, ShootEvent } from '@/types/game';
import * as THREE from 'three';

export const useGameNetworking = (roomId: string) => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Map<string, PlayerSnapshot>>(new Map());
  const [shootEvents, setShootEvents] = useState<ShootEvent[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Create a channel for this game room
    const channel = supabase.channel(`game_${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track player presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newPlayers = new Map<string, PlayerSnapshot>();
        
        Object.entries(state).forEach(([key, presences]: [string, any[]]) => {
          const presence = presences[0];
          if (presence) {
            newPlayers.set(key, presence as PlayerSnapshot);
          }
        });
        
        setPlayers(newPlayers);
      })
      .on('broadcast', { event: 'shoot' }, (payload) => {
        setShootEvents((prev) => [...prev, payload.payload as ShootEvent]);
        // Clear after animation
        setTimeout(() => {
          setShootEvents((prev) => prev.filter((e) => e !== payload.payload));
        }, 1000);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send initial presence
          await channel.track({
            id: user.id,
            position: { x: 0, y: 1, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            health: 100,
            timestamp: Date.now(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, user]);

  const updatePosition = async (position: THREE.Vector3, rotation: THREE.Euler) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.track({
      id: user.id,
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      health: 100,
      timestamp: Date.now(),
    });
  };

  const broadcastShoot = async (origin: THREE.Vector3, direction: THREE.Vector3) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'shoot',
      payload: {
        playerId: user.id,
        origin: { x: origin.x, y: origin.y, z: origin.z },
        direction: { x: direction.x, y: direction.y, z: direction.z },
        timestamp: Date.now(),
      },
    });
  };

  return {
    players,
    shootEvents,
    updatePosition,
    broadcastShoot,
  };
};
