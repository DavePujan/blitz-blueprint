import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Shield, MessageCircle, Trophy, ArrowLeft } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useClans } from '@/hooks/useClans';
import { useChat } from '@/hooks/useChat';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export default function Social() {
  const navigate = useNavigate();
  const [friendUsername, setFriendUsername] = useState('');
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [clanDesc, setClanDesc] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const { friends, friendRequests, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends();
  const { userClan, clanMembers, availableClans, createClan, joinClan, leaveClan } = useClans();
  const { messages, sendMessage } = useChat(undefined, userClan?.id);

  const handleSendFriendRequest = () => {
    if (friendUsername.trim()) {
      sendFriendRequest(friendUsername);
      setFriendUsername('');
    }
  };

  const handleCreateClan = () => {
    if (clanName.trim() && clanTag.trim()) {
      createClan(clanName, clanTag, clanDesc);
      setClanName('');
      setClanTag('');
      setClanDesc('');
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendMessage(chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover-tactical"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Social Hub
            </h1>
            <p className="text-muted-foreground">Connect with players and join clans</p>
          </div>
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 tactical-border">
            <TabsTrigger value="friends" className="gap-2">
              <Users className="h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="clans" className="gap-2">
              <Shield className="h-4 w-4" />
              Clans
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" disabled={!userClan}>
              <MessageCircle className="h-4 w-4" />
              Clan Chat
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6">
            <Card className="tactical-border hover-tactical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Add Friend
                </CardTitle>
                <CardDescription>Send a friend request by username</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  placeholder="Enter username..."
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
                  className="bg-muted/50"
                />
                <Button onClick={handleSendFriendRequest} className="bg-gradient-to-r from-primary to-accent">
                  Send Request
                </Button>
              </CardContent>
            </Card>

            {friendRequests.length > 0 && (
              <Card className="tactical-border">
                <CardHeader>
                  <CardTitle>Friend Requests</CardTitle>
                  <CardDescription>{friendRequests.length} pending request(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {friendRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{request.friend_profile?.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{request.friend_profile?.username}</span>
                          </div>
                          <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                            Accept
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Card className="tactical-border">
              <CardHeader>
                <CardTitle>Your Friends</CardTitle>
                <CardDescription>{friends.length} friend(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {friends.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No friends yet. Send some requests!</p>
                    ) : (
                      friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-tactical">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{friend.friend_profile?.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{friend.friend_profile?.username}</span>
                            <Badge variant="outline" className="border-primary/50">Online</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFriend(friend.id)}>
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clans Tab */}
          <TabsContent value="clans" className="space-y-6">
            {!userClan ? (
              <>
                <Card className="tactical-border hover-tactical">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Create Your Clan
                    </CardTitle>
                    <CardDescription>Found a new clan and recruit members</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Clan Name"
                      value={clanName}
                      onChange={(e) => setClanName(e.target.value)}
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Tag (max 5 characters)"
                      value={clanTag}
                      onChange={(e) => setClanTag(e.target.value.slice(0, 5))}
                      maxLength={5}
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={clanDesc}
                      onChange={(e) => setClanDesc(e.target.value)}
                      className="bg-muted/50"
                    />
                    <Button onClick={handleCreateClan} className="w-full bg-gradient-to-r from-primary to-accent">
                      Create Clan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="tactical-border">
                  <CardHeader>
                    <CardTitle>Available Clans</CardTitle>
                    <CardDescription>Join an existing clan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {availableClans.map((clan) => (
                          <div key={clan.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover-tactical">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary/20 text-primary">[{clan.tag}]</Badge>
                                <span className="font-bold">{clan.name}</span>
                              </div>
                              {clan.description && (
                                <p className="text-sm text-muted-foreground mt-1">{clan.description}</p>
                              )}
                            </div>
                            <Button onClick={() => joinClan(clan.id)}>Join</Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="tactical-border tactical-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <Badge className="bg-primary/20 text-primary text-lg">[{userClan.tag}]</Badge>
                        <span>{userClan.name}</span>
                      </CardTitle>
                      <CardDescription>{userClan.description}</CardDescription>
                    </div>
                    <Button variant="destructive" onClick={leaveClan}>Leave Clan</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members ({clanMembers.length}/{userClan.max_members})
                      </h3>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {clanMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{member.profile?.username[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-medium">{member.profile?.username}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {member.role === 'owner' && <Trophy className="h-3 w-3 mr-1 inline" />}
                                    {member.role}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="tactical-border h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Clan Chat
                </CardTitle>
                <CardDescription>Chat with your clan members</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{msg.sender_profile?.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{msg.sender_profile?.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-muted/50"
                  />
                  <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-accent">
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}