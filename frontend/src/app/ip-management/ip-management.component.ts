import { Component, OnInit } from "@angular/core";
import { IpService } from "../ip.service";
import { Client, IpEntry } from "../ip.model";

@Component({
	selector: "app-ip-management",
	templateUrl: "./ip-management.component.html",
	styleUrls: ["./ip-management.component.css"],
})
export class IpManagementComponent implements OnInit {
	clients: Client[] = [];
	ipEntries: IpEntry[] = [];

	editing: IpEntry | null = null;

	errorMessage = "";
	formErrorMessage = "";
	busy = false;

	constructor(private ipService: IpService) {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData(): void {
		this.ipService.getClients().subscribe({
			next: (clients: Client[]) => (this.clients = clients),
			error: (err) =>
				(this.errorMessage =
					"Unable to load IP entries. " + (err.message || "")),
		});

		this.ipService.getIpEntries().subscribe({
			next: (ips: IpEntry[]) => (this.ipEntries = ips),
			error: (err: any) =>
				(this.errorMessage =
					"Unable to load IP entries. " + (err.message || "")),
		});
	}

	onEdit(entry: IpEntry): void {
		this.editing = entry;
		this.formErrorMessage = "";
	}

	onCancelEdit(): void {
		this.editing = null;
		this.formErrorMessage = "";
	}

	onSave(payload: IpEntry): void {
		this.busy = true;
		this.formErrorMessage = "";

		const req = this.editing
			? this.ipService.updateIpEntry(payload)
			: this.ipService.createIpEntry(payload);

		req.subscribe({
			next: () => {
				this.busy = false;
				this.editing = null;
				this.loadData();
			},
			error: (err) => {
				this.busy = false;
				this.formErrorMessage =
					"Unable to save IP entry. " + (err.message || "");
			},
		});
	}

	onDelete(entry: IpEntry): void {
		this.ipService.deleteIpEntry(entry.InternalReference).subscribe({
			next: () => this.loadData(),
			error: () => (this.errorMessage = "Unable to delete IP entry."),
		});
	}

	getClientName(clientId: string): string {
		// TODO: this is running on every change detection cycle and should be optimised
		return this.clients.find((c) => c.Id === clientId)?.Name ?? "";
	}

	getIpType(type: string): string {
		switch (type) {
			case "Patent":
				return "Patent";
			case "TradeMark":
				return "Trade Mark";
			default:
				return type ?? "";
		}
	}
}
