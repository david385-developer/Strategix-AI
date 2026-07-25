import { useState } from "react";
import { Plus, MoveHorizontal as MoreHorizontal, Mail, CircleCheck as CheckCircle2, Clock, ListTodo, UserPlus, MessageSquare, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { teamMembers, tasks, activities } from "@/lib/data";
import { roleConfig, taskStatusConfig } from "@/lib/content-helpers";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const [tab, setTab] = useState("members");

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const reviewTasks = tasks.filter((t) => t.status === "review");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage members, track tasks, and review activity across your workspace."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Team" }]}
        actions={<Button><UserPlus className="h-4 w-4" /> Invite member</Button>}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Members", value: teamMembers.length, icon: UserPlus, color: "text-primary" },
          { label: "Open tasks", value: tasks.filter((t) => t.status !== "done").length, icon: ListTodo, color: "text-chart-2" },
          { label: "Pending review", value: reviewTasks.length, icon: Clock, color: "text-warning" },
          { label: "Completed", value: doneTasks.length, icon: CheckCircle2, color: "text-success" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Members */}
        <TabsContent value="members" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Member</th>
                    <th className="px-5 py-3 text-left font-medium">Role</th>
                    <th className="px-5 py-3 text-left font-medium">Tasks</th>
                    <th className="px-5 py-3 text-left font-medium">Last active</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamMembers.map((m) => {
                    const role = roleConfig[m.role];
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback style={{ background: m.color }} className="text-primary-foreground">{m.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Badge className={cn("border-0", role.className)}>{role.label}</Badge></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{m.tasksCompleted}/{m.tasksAssigned}</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-success" style={{ width: `${(m.tasksCompleted / m.tasksAssigned) * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{m.lastActive}</td>
                        <td className="px-5 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded-md p-1 text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Mail className="h-4 w-4" /> Message</DropdownMenuItem>
                              <DropdownMenuItem>Change role</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tasks board */}
        <TabsContent value="tasks">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "To Do", tasks: todoTasks, color: "bg-muted-foreground" },
              { title: "In Progress", tasks: inProgressTasks, color: "bg-primary" },
              { title: "In Review", tasks: reviewTasks, color: "bg-warning" },
              { title: "Done", tasks: doneTasks, color: "bg-success" },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("h-2 w-2 rounded-full", col.color)} />
                  <p className="text-sm font-semibold text-foreground">{col.title}</p>
                  <Badge variant="muted" className="ml-auto">{col.tasks.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {col.tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">No tasks</div>
                  ) : col.tasks.map((t) => (
                    <Card key={t.id} className="cursor-pointer transition-all hover:shadow-soft">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-foreground">{t.title}</p>
                        {t.campaign && <p className="mt-1 text-xs text-muted-foreground">{t.campaign}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {t.dueDate}
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                              {t.assignee.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground"><Plus className="h-3.5 w-3.5" /> Add task</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Activity feed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/40">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={cn(a.user === "AI Assistant" ? "bg-gradient-to-br from-primary to-chart-4 text-primary-foreground" : "bg-primary/10 text-primary", "text-[10px]")}>
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{a.user}</span> {a.action}{" "}
                      <span className="font-medium text-foreground">{a.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                  {a.type === "approved" && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>}
                  {a.type === "commented" && <Badge variant="muted"><MessageSquare className="h-3 w-3" /> Comment</Badge>}
                  {a.type === "published" && <Badge variant="default">Published</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
