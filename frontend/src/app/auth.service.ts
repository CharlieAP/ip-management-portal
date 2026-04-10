import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuthService {
	private readonly storageKey = "ipMgmtStaffEmail";

	constructor(private router?: Router) {}

	login(email: string): void {
		localStorage.setItem(this.storageKey, email);
		this.router?.navigate(["/ips"]);
	}

	logout(): void {
		localStorage.removeItem(this.storageKey);
		this.router?.navigate(["/"]);
	}

	isLoggedIn(): boolean {
		return !!this.userEmail;
	}

	get userEmail(): string | null {
		return localStorage.getItem(this.storageKey);
	}

	get authHeaders(): Record<string, string> {
		return this.userEmail ? { "X-Staff-Email": this.userEmail } : {};
	}
}
