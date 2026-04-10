import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Client, IpEntry } from "./ip.model";
import { environment } from "../environments/environment";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class IpService {
	private readonly apiBase = environment.apiBaseUrl;

	constructor(
		private http: HttpClient,
		private auth: AuthService,
	) {}

	private get headers(): HttpHeaders {
		return new HttpHeaders(this.auth.authHeaders);
	}

	getClients(): Observable<Client[]> {
		return this.http.get<Client[]>(`${this.apiBase}/clients`, {
			headers: this.headers,
		});
	}

	getIpEntries(): Observable<IpEntry[]> {
		return this.http.get<IpEntry[]>(`${this.apiBase}/ips`, {
			headers: this.headers,
		});
	}

	createIpEntry(entry: IpEntry): Observable<IpEntry> {
		return this.http.post<IpEntry>(`${this.apiBase}/ips`, entry, {
			headers: this.headers,
		});
	}

	updateIpEntry(entry: IpEntry): Observable<IpEntry> {
		return this.http.put<IpEntry>(
			`${this.apiBase}/ips/${entry.InternalReference}`,
			entry,
			{
				headers: this.headers,
			},
		);
	}

	deleteIpEntry(internalReference: string): Observable<void> {
		return this.http.delete<void>(`${this.apiBase}/ips/${internalReference}`, {
			headers: this.headers,
		});
	}
}
