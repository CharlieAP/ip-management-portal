import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IpService } from "../ip.service";
import { Client, IpEntry } from "../ip.model";
import { IpAssetFormComponent } from "../ip-asset-form/ip-asset-form.component";
import {
	ClientOption,
	IpAssetFormValue,
} from "../ip-asset-form/ip-asset-form.component";
import { SharedStateService } from "../shared-state.service";

@Component({
	selector: "app-ip-management",
	standalone: true,
	imports: [CommonModule, IpAssetFormComponent],
	templateUrl: "./ip-management.component.html",
	styleUrls: ["./ip-management.component.css"],
})
export class IpManagementComponent implements OnInit {
	private sharedStateService = inject(SharedStateService);

	clients: Client[] = [];
	ipEntries: IpEntry[] = [];

	editing: IpAssetFormValue | null = null;

	// private reference to the full IpEntry to preserve fields the form doesnt know about like CreatedAt and to determine what 'mode' the form is in
	private editingEntry: IpEntry | null = null;

	errorMessage = "";
	formErrorMessage = "";
	busy = false;

	constructor(private ipService: IpService) {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData() {
		this.initClients();
		this.initIpEntries();
	}

	initClients() {
		this.sharedStateService.loadClients();
		this.sharedStateService.clients$.subscribe({
			next: (clients) => {
				this.clients = clients;
			},
		});
	}

	initIpEntries() {
		this.sharedStateService.loadIpAssets();
		this.sharedStateService.ipAssets$.subscribe({
			next: (ips) => {
				this.ipEntries = ips;
			},
		});
	}

	// map API client model to form model
	get clientOptions(): ClientOption[] {
		return this.clients.map((c) => ({ id: c.Id, label: c.Name }));
	}

	onEdit(entry: IpEntry): void {
		this.editingEntry = entry;
		this.editing = {
			internalReference: entry.InternalReference,
			clientId: entry.ClientId,
			title: entry.Title,
			type: entry.Type,
			description: entry.Description,
		};
		this.formErrorMessage = "";
	}

	onCancelEdit(): void {
		this.editing = null;
		this.editingEntry = null;
		this.formErrorMessage = "";
	}

	onSave(formValue: IpAssetFormValue): void {
		this.busy = true;
		this.formErrorMessage = "";

		// map the form data back into the API model shape
		const payload: IpEntry = {
			InternalReference: formValue.internalReference,
			ClientId: formValue.clientId,
			Title: formValue.title,
			Type: formValue.type,
			Description: formValue.description,
			CreatedAt: this.editingEntry?.CreatedAt ?? new Date().toISOString(),
		};

		const req = this.editingEntry
			? this.ipService.updateIpEntry(payload)
			: this.ipService.createIpEntry(payload);

		req.subscribe({
			next: () => {
				this.busy = false;
				this.editing = null;
				this.editingEntry = null;
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
