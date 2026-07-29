import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  addAdminMutationOptions,
  adminListQueryOptions,
  deleteAdminMutationOptions,
  resetAdminPasswordMutationOptions,
} from '#/lib/api-client'
import { authClient } from '#/lib/auth-client'
import { showErrorDialog } from '#/lib/error-dialog-store'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { ArrowLeft, KeyRound, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/admin/admins')({
  component: AdminsPage,
})

function AdminsPage() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const admins = useQuery(adminListQueryOptions)
  const canManage = admins.data?.canManage ?? false

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetTarget, setResetTarget] = useState<{ id: string; email: string } | null>(null)
  const [resetPassword, setResetPassword] = useState('')

  const addAdmin = useMutation({
    ...addAdminMutationOptions,
    onSuccess: () => {
      toast.success('Admin added')
      setEmail('')
      setName('')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
    onError: (error) => showErrorDialog(error.message || 'Failed to add admin'),
  })

  const resetPasswordMutation = useMutation({
    ...resetAdminPasswordMutationOptions,
    onSuccess: () => {
      toast.success('Password reset — they must set a new one on next sign-in')
      setResetTarget(null)
      setResetPassword('')
    },
    onError: (error) => showErrorDialog(error.message || 'Failed to reset password'),
  })

  const deleteAdminMutation = useMutation({
    ...deleteAdminMutationOptions,
    onSuccess: () => {
      toast.success('Admin removed')
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
    onError: (error) => showErrorDialog(error.message || 'Failed to remove admin'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addAdmin.mutate({ name, email, password })
  }

  return (
    <div className="p-4 md:p-8 w-full text-foreground">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="text-xl font-semibold mb-6">Admin users</h1>

      {!admins.isLoading && !canManage && (
        <p className="text-sm text-muted-foreground mb-6">
          Only the super admin can add, reset, or remove admin accounts.
        </p>
      )}

      <div className={canManage ? 'grid gap-6 md:grid-cols-[1fr_320px]' : ''}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-card">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
              )}
              {admins.data?.admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell className="font-mono text-xs">{admin.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {admin.mustChangePassword && (
                      <Badge variant="outline">Pending password reset</Badge>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {admin.id !== session?.user?.id && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Reset password"
                            onClick={() => setResetTarget({ id: admin.id, email: admin.email })}
                          >
                            <KeyRound className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove admin"
                            onClick={() => {
                              if (confirm(`Remove ${admin.email} as an admin?`)) {
                                deleteAdminMutation.mutate({ userId: admin.id })
                              }
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {canManage && (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Add admin</CardTitle>
              <CardDescription>Must use a @coinmonie.com email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    placeholder="name@coinmonie.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Temporary password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={addAdmin.isPending} className="w-full rounded-xl bg-accent text-accent-foreground">
                  {addAdmin.isPending ? 'Adding...' : 'Add admin'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={Boolean(resetTarget)} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Set a temporary password for {resetTarget?.email}. They'll be required to change it on next sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="reset-password">New temporary password</Label>
            <Input
              id="reset-password"
              type="password"
              minLength={8}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              disabled={resetPasswordMutation.isPending || resetPassword.length < 8}
              className="rounded-xl bg-accent text-accent-foreground"
              onClick={() => {
                if (resetTarget) {
                  resetPasswordMutation.mutate({ userId: resetTarget.id, password: resetPassword })
                }
              }}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
