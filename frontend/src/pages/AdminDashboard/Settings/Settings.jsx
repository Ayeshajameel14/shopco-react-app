
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  UserRound,
  Store,
  ShieldCheck,
  Save,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import styles from "./Settings.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Settings() {
  const { user, token, updateAccount } = useAuth();

  const [storeName, setStoreName] = useState("ShopCo");
  const [currency, setCurrency] = useState("PKR");
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load settings");
        }

        setStoreName(data.settings.storeName || "ShopCo");
        setCurrency(data.settings.currency || "PKR");
        setEmailNotifications(
          data.settings.emailNotifications ?? true
        );
      } catch (err) {
        setError(err.message || "Unable to load settings");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchSettings();
    } else {
      setLoading(false);
      setError("Please log in as an administrator.");
    }
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeName,
          currency,
          emailNotifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save settings");
      }

      setStoreName(data.settings.storeName);
      setCurrency(data.settings.currency);
      setEmailNotifications(data.settings.emailNotifications);
      setMessage("Store settings saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleAccountSubmit(event) {
    event.preventDefault();

    setAccountError("");
    setAccountMessage("");

    if (newPassword && newPassword !== confirmNewPassword) {
      setAccountError("New passwords do not match.");
      return;
    }

    try {
      setAccountSaving(true);

      const result = await updateAccount({
        email: accountEmail.trim(),
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (newPassword) {
        setAccountMessage(
          "Password updated. Please log in again with your new password."
        );
        return;
      }

      setAccountEmail(result.user.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setAccountMessage(
        result.message || "Account updated successfully."
      );
    } catch (err) {
      setAccountError(err.message || "Unable to update account.");
    } finally {
      setAccountSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>ADMINISTRATION</div>
          <h1>Settings</h1>
          <p>Manage your store preferences and account details.</p>
        </div>

        <div className={styles.headerIcon}>
          <SettingsIcon size={24} />
        </div>
      </div>

      {error && (
        <div role="alert" className={styles.errorMessage}>
          {error}
        </div>
      )}

      {message && (
        <div role="status" className={styles.successMessage}>
          {message}
        </div>
      )}

      <div className={styles.settingsGrid}>
        {/* Admin Profile */}
        <section className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <UserRound size={20} />
            </div>
            <div>
              <h2>Admin Profile</h2>
              <p>Your signed-in account details</p>
            </div>
          </div>

          <div className={styles.profileDetails}>
            <div>
              <span>Name</span>
              <strong>{user?.name || "Admin"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user?.email || "Not available"}</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>
                {user?.role === "admin" ? "Administrator" : user?.role}
              </strong>
            </div>
          </div>
        </section>

        {/* Store Preferences */}
        <section className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Store size={20} />
            </div>
            <div>
              <h2>Store Preferences</h2>
              <p>Update your store configuration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="storeName">Store Name</label>
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                placeholder="Enter store name"
                required
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>

            <label className={styles.toggleRow}>
              <span>
                <strong>Email Notifications</strong>
                <small>Store notification preference</small>
              </span>

              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(event) =>
                  setEmailNotifications(event.target.checked)
                }
              />
            </label>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Account Settings */}
        <section className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <LockKeyhole size={20} />
            </div>
            <div>
              <h2>Account Settings</h2>
              <p>Update your admin email or password</p>
            </div>
          </div>

          {accountError && (
            <div role="alert" className={styles.errorMessage}>
              {accountError}
            </div>
          )}

          {accountMessage && (
            <div role="status" className={styles.successMessage}>
              {accountMessage}
            </div>
          )}

          <form onSubmit={handleAccountSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="accountEmail">Admin Email</label>
              <input
                id="accountEmail"
                type="email"
                value={accountEmail}
                onChange={(event) => setAccountEmail(event.target.value)}
                placeholder="Enter admin email"
                autoComplete="email"
                required
              />
            </div>

            {/* Current Password */}
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>

              <div className={styles.passwordWrapper}>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowCurrentPassword((prev) => !prev)
                  }
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showCurrentPassword}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>

              <div className={styles.passwordWrapper}>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                  minLength={8}
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showNewPassword}
                >
                  {showNewPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <small>
                Use at least 8 characters if changing your password.
              </small>
            </div>

            {/* Confirm New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmNewPassword">
                Confirm New Password
              </label>

              <div className={styles.passwordWrapper}>
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(event) =>
                    setConfirmNewPassword(event.target.value)
                  }
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={accountSaving}
            >
              <Save size={17} />
              {accountSaving ? "Updating..." : "Update Account"}
            </button>
          </form>
        </section>

        {/* Security */}
        <section className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>Security</h2>
              <p>Protected administrator access</p>
            </div>
          </div>

          <p className={styles.securityText}>
            Only authenticated users with administrator permissions can
            access and update administrator settings.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Settings;
