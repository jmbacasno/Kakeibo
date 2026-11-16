import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, RotateCcw, Save, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/ToastProvider';
import {
  changeAccountPassword,
  updateAccountDetails,
} from '../features/auth/authSlice';
import { User } from '../types/models';
import { formatDateDisplay, formatDateTimeDisplay } from '../utils/formatters';

interface ProfileDetailsFormProps {
  user: User;
  savingAccount: boolean;
}

function ProfileDetailsForm({ user, savingAccount }: ProfileDetailsFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [formError, setFormError] = useState('');

  const isDirty = useMemo(
    () =>
      firstName.trim() !== user.firstName ||
      lastName.trim() !== user.lastName ||
      email.trim().toLowerCase() !== user.email.toLowerCase(),
    [firstName, lastName, email, user]
  );

  const handleDiscard = () => {
    setFormError('');
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedFirst) {
      setFormError('First name is required.');
      return;
    }
    if (!trimmedLast) {
      setFormError('Last name is required.');
      return;
    }
    if (!trimmedEmail) {
      setFormError('Email is required.');
      return;
    }
    if (trimmedEmail !== 'admin' && !trimmedEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const res = await dispatch(
      updateAccountDetails({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
      })
    );

    if (updateAccountDetails.fulfilled.match(res)) {
      toast.success('Account profile updated.');
    } else {
      setFormError(res.payload || 'Unable to update account profile.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-line rounded-xl p-6 space-y-5"
      noValidate
    >
      <div className="border-b border-line pb-4">
        <h3 className="text-sm font-semibold text-ink">01. Profile Details</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Update your first name, last name, and sign-in email address.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg border border-danger-line px-4 py-3 text-sm text-danger"
        >
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="account-first-name"
            className="block text-xs font-medium text-ink-secondary mb-1.5"
          >
            First name
          </label>
          <input
            id="account-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <div>
          <label
            htmlFor="account-last-name"
            className="block text-xs font-medium text-ink-secondary mb-1.5"
          >
            Last name
          </label>
          <input
            id="account-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="account-email"
          className="block text-xs font-medium text-ink-secondary mb-1.5"
        >
          Email address
        </label>
        <input
          id="account-email"
          type={email === 'admin' ? 'text' : 'email'}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={savingAccount || !isDirty}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-ink-secondary bg-canvas border border-line-strong rounded-lg hover:bg-subtle transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>Discard changes</span>
        </button>

        <button
          type="submit"
          disabled={savingAccount || !isDirty}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{savingAccount ? 'Saving...' : 'Save profile'}</span>
        </button>
      </div>
    </form>
  );
}

function ChangePasswordForm({ savingPassword }: { savingPassword: boolean }) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [formError, setFormError] = useState('');

  const canSubmit = currentPassword.length > 0 && newPassword.length > 0 && repeatPassword.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentPassword) {
      setFormError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword === currentPassword) {
      setFormError('New password must be different from your current password.');
      return;
    }
    if (newPassword !== repeatPassword) {
      setFormError('New passwords do not match.');
      return;
    }

    const res = await dispatch(
      changeAccountPassword({
        currentPassword,
        newPassword,
        repeatPassword,
      })
    );

    if (changeAccountPassword.fulfilled.match(res)) {
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      toast.success('Password updated successfully.');
    } else {
      setFormError(res.payload || 'Unable to update password.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-line rounded-xl p-6 space-y-5"
      noValidate
    >
      <div className="border-b border-line pb-4">
        <h3 className="text-sm font-semibold text-ink">02. Change Password</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Confirm your current password before setting a new one (minimum 8 characters).
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg border border-danger-line px-4 py-3 text-sm text-danger"
        >
          {formError}
        </div>
      )}

      <div>
        <label
          htmlFor="account-current-password"
          className="block text-xs font-medium text-ink-secondary mb-1.5"
        >
          Current password
        </label>
        <input
          id="account-current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="account-new-password"
            className="block text-xs font-medium text-ink-secondary mb-1.5"
          >
            New password
          </label>
          <input
            id="account-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <div>
          <label
            htmlFor="account-repeat-password"
            className="block text-xs font-medium text-ink-secondary mb-1.5"
          >
            Repeat new password
          </label>
          <input
            id="account-repeat-password"
            type="password"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={savingPassword || !canSubmit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          <span>{savingPassword ? 'Updating password...' : 'Update password'}</span>
        </button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const { user, loading, savingAccount, savingPassword } = useAppSelector((state) => state.auth);
  const settings = useAppSelector((state) => state.settings.data);

  const dateFormat = settings?.dateFormat ?? 'MMM D, YYYY';
  const language = settings?.language ?? 'en';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Account &amp; Security</h2>
        <p className="text-xs text-ink-muted mt-1">
          Manage your profile identity, sign-in credentials, and security activity.
        </p>
      </div>

      {loading && !user ? (
        <CardSkeleton rows={6} />
      ) : user ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <ProfileDetailsForm
              key={`${user.id}-${user.updatedAt ?? ''}-${user.email}`}
              user={user}
              savingAccount={savingAccount}
            />
            <ChangePasswordForm savingPassword={savingPassword} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <section className="bg-surface border border-line rounded-xl p-6 space-y-5 sticky top-20">
              <div>
                <h3 className="text-sm font-semibold text-ink">03. Account Activity</h3>
                <p className="text-xs text-ink-muted mt-0.5 truncate">
                  {user.firstName} {user.lastName} · {user.email}
                </p>
              </div>

              <div className="space-y-3.5 text-sm border-t border-b border-line py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Last sign-in</span>
                  <span className="font-mono tabular-nums text-xs font-medium text-ink text-right">
                    {user.lastLoginAt
                      ? formatDateTimeDisplay(user.lastLoginAt, dateFormat, language)
                      : 'Not recorded yet'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Total sign-ins</span>
                  <span className="font-mono tabular-nums font-semibold text-ink">
                    {user.loginCount}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Failed attempts</span>
                  <span className="font-mono tabular-nums font-semibold text-ink">
                    {user.failLoginCount}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Member since</span>
                  <span className="font-mono tabular-nums text-xs text-ink-secondary">
                    {user.createdAt
                      ? formatDateDisplay(user.createdAt, dateFormat, language)
                      : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Last updated</span>
                  <span className="font-mono tabular-nums text-xs text-ink-secondary">
                    {user.updatedAt
                      ? formatDateTimeDisplay(user.updatedAt, dateFormat, language)
                      : '—'}
                  </span>
                </div>
              </div>

              <Link
                to="/settings"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-ink-secondary bg-canvas border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap shrink-0"
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span>Personal preferences</span>
              </Link>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
