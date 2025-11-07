import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Flag, Ban, TrendingUp, MessageSquare, Activity, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModeration } from '@/hooks/useModeration';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function Admin() {
  const navigate = useNavigate();
  const { reports, bans, loading, isModerator, reviewReport, banPlayer, unbanPlayer } =
    useModeration();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMatches: 0,
    reportsToday: 0
  });

  if (!isModerator && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Moderation and management tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports.length}</div>
              <p className="text-xs text-muted-foreground">require review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bans</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bans.filter((b) => b.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">currently enforced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bans</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bans.length}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Flag className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="bans">
              <Ban className="h-4 w-4 mr-2" />
              Bans
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">online in last 24h</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">all time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.reportsToday}</div>
                  <p className="text-xs text-muted-foreground">last 24 hours</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest moderation actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Report: {report.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Bans</CardTitle>
                  <CardDescription>Currently enforced bans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bans.filter(b => b.is_active).slice(0, 5).map((ban) => (
                      <div key={ban.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Ban className="h-4 w-4 text-destructive" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{ban.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {ban.ban_type === 'permanent' ? 'Permanent' : `Expires: ${new Date(ban.expires_at).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Reports</CardTitle>
                <CardDescription>Review and take action on player reports</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reported User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {report.reported_user_id}
                          </TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === 'pending'
                                  ? 'default'
                                  : report.status === 'resolved'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Report</DialogTitle>
                                  <DialogDescription>
                                    Take action on this player report
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Reason</Label>
                                    <p className="text-sm">{report.reason}</p>
                                  </div>
                                  {report.description && (
                                    <div>
                                      <Label>Description</Label>
                                      <p className="text-sm">{report.description}</p>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        reviewReport(report.id, 'Dismissed', 'dismissed');
                                      }}
                                      variant="outline"
                                    >
                                      Dismiss
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        reviewReport(report.id, 'Warning issued', 'resolved');
                                      }}
                                      variant="secondary"
                                    >
                                      Warn
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        banPlayer(
                                          report.reported_user_id,
                                          report.reason,
                                          'temporary'
                                        );
                                        reviewReport(report.id, 'User banned', 'resolved');
                                      }}
                                      variant="destructive"
                                    >
                                      Ban
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Bans</CardTitle>
                <CardDescription>Manage banned players</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bans.map((ban) => (
                      <TableRow key={ban.id}>
                        <TableCell>{new Date(ban.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{ban.user_id}</TableCell>
                        <TableCell>{ban.reason}</TableCell>
                        <TableCell>
                          <Badge variant={ban.ban_type === 'permanent' ? 'destructive' : 'default'}>
                            {ban.ban_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ban.expires_at
                            ? new Date(ban.expires_at).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ban.is_active ? 'destructive' : 'secondary'}>
                            {ban.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ban.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unbanPlayer(ban.id)}
                            >
                              Unban
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage user accounts</CardDescription>
                  </div>
                  <Button variant="outline">
                    <UserCog className="h-4 w-4 mr-2" />
                    Manage Roles
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">User data</p>
                            <p className="text-sm text-muted-foreground">user@example.com</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>User</Badge>
                      </TableCell>
                      <TableCell>Jan 1, 2025</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Logs Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Chat Logs</CardTitle>
                <CardDescription>Monitor and review chat messages across all rooms and clans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Search messages..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="rooms">Room Chat</SelectItem>
                        <SelectItem value="clans">Clan Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">P1</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">Player123</span>
                              <Badge variant="outline" className="text-xs">Room Chat</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date().toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">Sample chat message content</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
