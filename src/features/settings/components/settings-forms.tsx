"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePendingAction } from "@/hooks/use-pending-action";
import { logout } from "@/features/auth/lib/logout";
import {
  changePasswordAction,
  softDeleteAccountAction,
  updatePreferencesAction,
  updateProfileAction,
} from "@/features/settings/actions/settings-actions";

interface SettingsFormsProps {
  initial: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    bio: string;
    referralCode: string | null;
    preferences: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      marketingEmails: boolean;
      language: "en" | "hi";
      privacyShowOnLeaderboard: boolean;
    };
  };
}

export function SettingsForms({ initial }: SettingsFormsProps) {
  const { pending, run, isRunning } = usePendingAction();
  const [prefs, setPrefs] = useState(initial.preferences);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  return (
    <div className="space-y-8">
      <section className="border-border space-y-4 rounded-2xl border p-5">
        <div>
          <h3 className="font-display text-lg font-semibold">Profile</h3>
          <p className="text-muted-foreground text-sm">
            Personal information shown on your NexPlast profile.
          </p>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run("profile", async () => {
              const result = await updateProfileAction({
                name: String(fd.get("name") ?? ""),
                phone: String(fd.get("phone") ?? ""),
                city: String(fd.get("city") ?? ""),
                address: String(fd.get("address") ?? ""),
                bio: String(fd.get("bio") ?? ""),
              });
              if (result.success) toast.success(result.message);
              else toast.error(result.error);
            });
          }}
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={initial.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={initial.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={initial.phone} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={initial.city} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={initial.address}
              rows={2}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={initial.bio} rows={3} />
          </div>
          {initial.referralCode ? (
            <p className="text-muted-foreground text-sm sm:col-span-2">
              Referral code:{" "}
              <span className="text-foreground font-mono font-medium">
                {initial.referralCode}
              </span>
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={pending}
              loading={isRunning("profile")}
            >
              Save profile
            </Button>
          </div>
        </form>
      </section>

      <section className="border-border space-y-4 rounded-2xl border p-5">
        <div>
          <h3 className="font-display text-lg font-semibold">Preferences</h3>
          <p className="text-muted-foreground text-sm">
            Theme is controlled from the navbar. Manage notifications, language,
            and privacy here.
          </p>
        </div>
        <div className="space-y-4">
          {(
            [
              ["emailNotifications", "Email notifications"],
              ["pushNotifications", "In-app notifications"],
              ["marketingEmails", "Marketing emails"],
              ["privacyShowOnLeaderboard", "Show me on leaderboard"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={prefs[key]}
                onCheckedChange={(checked) =>
                  setPrefs((p) => ({ ...p, [key]: Boolean(checked) }))
                }
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              className="border-border bg-background flex h-9 w-full rounded-lg border px-3 text-sm"
              value={prefs.language}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  language: e.target.value as "en" | "hi",
                }))
              }
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <Button
            type="button"
            disabled={pending}
            loading={isRunning("preferences")}
            onClick={() =>
              run("preferences", async () => {
                const result = await updatePreferencesAction(prefs);
                if (result.success) toast.success(result.message);
                else toast.error(result.error);
              })
            }
          >
            Save preferences
          </Button>
        </div>
      </section>

      <section className="border-border space-y-4 rounded-2xl border p-5">
        <div>
          <h3 className="font-display text-lg font-semibold">Password</h3>
          <p className="text-muted-foreground text-sm">
            Change your password for email/password accounts.
          </p>
        </div>
        <form
          className="grid max-w-md gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run("password", async () => {
              const result = await changePasswordAction({
                currentPassword: String(fd.get("currentPassword") ?? ""),
                newPassword: String(fd.get("newPassword") ?? ""),
                confirmPassword: String(fd.get("confirmPassword") ?? ""),
              });
              if (result.success) {
                toast.success(result.message);
                e.currentTarget.reset();
              } else toast.error(result.error);
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={pending}
            loading={isRunning("password")}
          >
            Update password
          </Button>
        </form>
      </section>

      <section className="border-destructive/40 bg-destructive/5 space-y-4 rounded-2xl border p-5">
        <div>
          <h3 className="font-display text-destructive text-lg font-semibold">
            Soft delete account
          </h3>
          <p className="text-muted-foreground text-sm">
            Deactivates your account and signs you out. Type DELETE to confirm.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="deleteConfirm">Confirmation</Label>
            <Input
              id="deleteConfirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={pending || deleteConfirm !== "DELETE"}
            loading={isRunning("delete")}
            onClick={() =>
              run("delete", async () => {
                const result = await softDeleteAccountAction({
                  confirm: "DELETE",
                });
                if (result.success) {
                  toast.success(result.message);
                  await logout("/");
                } else toast.error(result.error);
              })
            }
          >
            Delete account
          </Button>
        </div>
      </section>
    </div>
  );
}
