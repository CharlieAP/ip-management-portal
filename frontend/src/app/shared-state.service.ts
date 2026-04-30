// shared state service for sharing data across components without prop drilling
// still hands off the data fetching to ip service to avoid coupling shared state to API related logic

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable, concatMap, map, of } from "rxjs";
import { Client, IpEntry } from "./ip.model";
import { IpService } from "./ip.service";

@Injectable({ providedIn: "root" })
export class SharedStateService {
	private clientsSubject = new BehaviorSubject<Client[]>([]);
	clients$ = this.clientsSubject.asObservable();

	private ipAssetsSubject = new BehaviorSubject<IpEntry[]>([]);
	ipAssets$ = this.ipAssetsSubject.asObservable();

	constructor(private ipService: IpService) {}

	// TODO: swap to a reload pattern like IP assets do if a feature was added to create/update/delete clients
	loadClients(): Observable<Client[]> {
		if (this.clientsSubject.value.length === 0) {
			// only load if there are no clients loaded
			return this.ipService.getClients().pipe(
				map((clients: Client[]) => {
					this.clientsSubject.next(clients);
					return clients;
				}),
			);
		}

		// return clients as an observable if already loaded
		return of(this.clientsSubject.value);
	}

	loadIpAssets(): Observable<IpEntry[]> {
		if (this.ipAssetsSubject.value.length === 0) {
			return this.reloadIpAssets();
		}

		return of(this.ipAssetsSubject.value);
	}

	createIpAsset(entry: IpEntry): Observable<void> {
		return this.ipService.createIpEntry(entry).pipe(
			map((savedEntry) => {
				console.log(
					"Created IP entry with references: ",
					savedEntry.InternalReference,
				);
				return savedEntry;
			}),
			concatMap(() => this.reloadIpAssets()),
			map(() => undefined),
		);
	}

	updateIpAsset(entry: IpEntry): Observable<void> {
		return this.ipService.updateIpEntry(entry).pipe(
			concatMap(() => this.reloadIpAssets()),
			map(() => undefined),
		);
	}

	deleteIpAsset(internalReference: string): Observable<void> {
		return this.ipService.deleteIpEntry(internalReference).pipe(
			map(() => {
				console.log("Deleted IP entry with reference: " + internalReference);
				return internalReference;
			}),
			concatMap(() => this.reloadIpAssets()),
			map(() => undefined), // makes return type Observable<void>
		);
	}

	private reloadIpAssets(): Observable<IpEntry[]> {
		// utility method to refresh IP assets after create/update/delete
		// returns an observable
		return this.ipService.getIpEntries().pipe(
			map((ips: IpEntry[]) => {
				this.ipAssetsSubject.next(ips);
				return ips;
			}),
		);
	}
}
