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
					// todo: return a user friendly error message to the component
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

	reloadIpAssets(): void {
		// utility method to refresh IP assets after create/update/delete operations
		this.ipService.getIpEntries().subscribe({
			next: (ips: IpEntry[]) => {
				this.ipAssetsSubject.next(ips);
			},
			error: (err) =>
				console.error("Unable to load IP entries. " + (err.message || "")),
		});
	}

	createIpAsset(entry: IpEntry): void {
		this.ipService.createIpEntry(entry).subscribe({
			next: (savedEntry) => {
				this.reloadIpAssets();
				console.log(
					"Created IP entry with references: ",
					savedEntry.InternalReference,
				);
			},
			error: () => console.error("Unable to create IP entry."),
		});
	}

	updateIpAsset(entry: IpEntry): void {
		this.ipService.updateIpEntry(entry).subscribe({
			next: () => {
				this.reloadIpAssets();
			},
			error: () =>
				console.error(
					"Unable to update IP asset with internal reference: ",
					entry.InternalReference,
				),
		});
	}

	deleteIpAsset(internalReference: string): void {
		this.ipService.deleteIpEntry(internalReference).subscribe({
			next: () => {
				this.reloadIpAssets();
				console.log("Deleted IP entry with reference: " + internalReference);
			},
			error: () => console.error("Unable to delete IP entry."),
		});
	}
}
