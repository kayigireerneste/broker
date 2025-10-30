"use client";

import { type ReactNode, useMemo } from "react";
import { ChevronRight, LogOut, Menu, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export interface SettingsLayoutNavItem {
	id: string;
	label: string;
	description?: string;
	icon?: ReactNode;
	disabled?: boolean;
}

interface SettingsLayoutProps {
	title: string;
	description?: string;
	navItems?: SettingsLayoutNavItem[];
	activeItem?: string;
	onItemSelect?: (id: string) => void;
	actions?: ReactNode;
	userRole?: "client" | "broker" | "admin" | "auditor";
	userName?: string;
	userEmail?: string;
	onDeleteAccount?: () => void;
	onLogout?: () => void;
	children: ReactNode;
}

export default function SettingsLayout({
	title,
	description,
	navItems = [],
	activeItem,
	onItemSelect,
	actions,
	userRole,
	userName,
	userEmail,
	onDeleteAccount,
	onLogout,
	children,
}: SettingsLayoutProps) {
	const hasNavigation = navItems.length > 0;
	const { user, logout: authLogout } = useAuth();

	const derivedRole = useMemo(() => {
		if (userRole) return userRole;
		const role = typeof user?.role === "string" ? user.role.toLowerCase() : undefined;
		return role === "client" || role === "broker" || role === "admin" || role === "auditor"
			? role
			: "client";
	}, [userRole, user?.role]);

	const derivedName = useMemo(() => {
		if (userName) return userName;
		const first = (user?.firstName as string | undefined) ?? "";
		const last = (user?.lastName as string | undefined) ?? "";
		const fullName = `${first} ${last}`.trim();
		if (fullName) return fullName;
		if (user?.email) return user.email.split("@")[0];
		return "User";
	}, [userName, user?.firstName, user?.lastName, user?.email]);

	const derivedEmail = useMemo(() => {
		if (userEmail) return userEmail;
		return typeof user?.email === "string" ? user.email : "";
	}, [userEmail, user?.email]);

	const handleLogout = () => {
		if (onLogout) {
			onLogout();
			return;
		}
		if (typeof authLogout === "function") {
			authLogout();
		} else {
			console.warn("Logout action not implemented");
		}
	};

	const handleDeleteAccount = () => {
		if (onDeleteAccount) {
			onDeleteAccount();
			return;
		}
		console.warn("Delete account action not implemented");
	};

	return (
		<DashboardLayout
			userRole={derivedRole}
			userName={derivedName}
			userEmail={derivedEmail}
		>
			<div className="mx-auto max-w-6xl pb-10 space-y-6">
				<header className="flex flex-col gap-4 rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur">
					<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-2xl font-semibold text-[#004B5B] md:text-3xl">
								{title}
							</h1>
							{description && (
								<p className="mt-1 text-sm text-slate-600 md:text-base">
									{description}
								</p>
							)}
						</div>
						{actions && (
							<div className="flex items-center gap-3 text-sm md:text-base">
								{actions}
							</div>
						)}
					</div>
					{hasNavigation && (
						<div className="md:hidden">
							<label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
								<Menu className="h-4 w-4" aria-hidden="true" /> Sections
							</label>
							<div className="relative mt-2">
								<select
									className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-700 focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
									value={activeItem}
									onChange={(event) => onItemSelect?.(event.target.value)}
								>
									{navItems.map((item) => (
										<option key={item.id} value={item.id} disabled={item.disabled}>
											{item.label}
										</option>
									))}
								</select>
								<ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							</div>
						</div>
					)}
				</header>

				<section className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
					{hasNavigation && (
						<aside className="hidden flex-col gap-2 rounded-3xl bg-white/90 p-4 shadow-sm backdrop-blur md:flex">
							{navItems.map((item) => {
								const isActive = item.id === activeItem;
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => !item.disabled && onItemSelect?.(item.id)}
										disabled={item.disabled}
										className={`group flex items-start gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-150 ${
											isActive
												? "bg-[#004B5B]/10 text-[#004B5B] shadow-sm"
												: "text-slate-500 hover:border-[#004B5B]/40 hover:bg-[#004B5B]/5 hover:text-[#004B5B]"
											} ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
									>
										{item.icon && (
											<span className="mt-0.5 text-[#004B5B] group-hover:text-[#003641]">
												{item.icon}
											</span>
										)}
										<span>
											<span className="block text-sm font-medium md:text-base">
												{item.label}
											</span>
											{item.description && (
												<span className="mt-1 block text-xs text-slate-500">
													{item.description}
												</span>
											)}
										</span>
										{isActive && (
											<ChevronRight className="ml-auto h-4 w-4 text-[#004B5B]" aria-hidden="true" />
										)}
									</button>
								);
							})}
						</aside>
					)}

					<main className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
						<div className="flex flex-col gap-6">
							{children}
							<Card className="p-6" hover={false}>
								<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
									<div>
										<h3 className="text-lg font-semibold text-[#004B5B]">Account actions</h3>
										<p className="mt-1 text-sm text-slate-500">
											Sign out safely or permanently delete your account. Deletion is irreversible.
										</p>
									</div>
									<div className="flex flex-col gap-3 sm:flex-row">
										<Button
											type="button"
											variant="primary"
											className="flex items-center gap-2 px-5"
											onClick={handleLogout}
										>
											<LogOut className="h-4 w-4" aria-hidden="true" />
											<span>Log out</span>
										</Button>
										<Button
											type="button"
											variant="secondary"
											className="flex items-center gap-2 bg-red-50! text-red-600! hover:bg-red-100!"
											onClick={handleDeleteAccount}
										>
											<Trash2 className="h-4 w-4"  aria-hidden="true" />
											<span>Delete account</span>
										</Button>
									</div>
								</div>
							</Card>
						</div>
					</main>
				</section>
			</div>
		</DashboardLayout>
	);
}
