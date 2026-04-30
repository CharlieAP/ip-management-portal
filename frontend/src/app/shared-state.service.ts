// shared state service for sharing data across components without prop drilling
// still hands off the data fetching to ip service to avoid coupling shared state to API related logic

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Client, IpEntry } from "./ip.model";
import { IpService } from "./ip.service";

@Injectable({ providedIn: "root" })
export class SharedStateService {
	private clientsSubject = new BehaviorSubject<Client[]>([]);
	clients$ = this.clientsSubject.asObservable();

	private ipAssetsSubject = new BehaviorSubject<IpEntry[]>([]);
	ipAssets$ = this.ipAssetsSubject.asObservable();

	constructor(private ipService: IpService) {}

	loadClients(): void {
		if (this.clientsSubject.value.length === 0) {
			// only load if there are no clients loaded
			this.ipService.getClients().subscribe({
				next: (clients: Client[]) => this.clientsSubject.next(clients),
				error: (err) =>
					console.error("Unable to load clients. " + (err.message || "")),
			});
		}
	}

	loadIpAssets(): void {
		if (this.ipAssetsSubject.value.length === 0) {
			this.ipService.getIpEntries().subscribe({
				next: (ips: IpEntry[]) => this.ipAssetsSubject.next(ips),
				error: (err) =>
					console.error("Unable to load IP entries. " + (err.message || "")),
			});
		}
	}
}
