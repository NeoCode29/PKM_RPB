"use client"
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "reviewer";
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "reviewer">("all");
  const [isEdit, setIsEdit] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    filtered = filtered.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users, roleFilter]);

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select();
    if (data) setUsers(data);
    if (error) console.error("Fetch error:", error);
  }

  async function handleSave() {
    if (!editUser.id) return;
    const { error } = await supabase
      .from("users")
      .update({ username: editUser.username, role: editUser.role })
      .eq("id", editUser.id);
    if (error) return console.error("Update error:", error);
    setIsEdit(false);
    setSelectedUser(null);
    fetchUsers();
  }

  return (
    <div className="w-full flex justify-center  min-h-screen p-4">
      <Card className="w-full max-w-5xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <Input
              placeholder="Search by username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[250px]"
            />
            <Select onValueChange={(val) => setRoleFilter(val as any)} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer hover:bg-gray-100">
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditUser(user);
                        setIsEdit(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser && !isEdit} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Detail</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-xs">Username:</label>
              <p className="text-gray-900 text-md">{selectedUser?.username}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-xs">Email:</label>
              <p className="text-gray-900 text-md">{selectedUser?.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-xs">Role:</label>
              <p className="text-gray-900 text-md">{selectedUser?.role}</p>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      <Dialog open={isEdit} onOpenChange={() => setIsEdit(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editUser.username || ""}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              placeholder="Username"
            />
            <Select
              value={editUser.role}
              onValueChange={(val) => setEditUser({ ...editUser, role: val as "admin" | "reviewer" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}