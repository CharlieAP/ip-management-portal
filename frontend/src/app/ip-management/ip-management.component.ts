import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
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

	constructor() {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData() {
		this.initClients();
		this.initIpEntries();
	}

	initClients() {
		this.sharedStateService.loadClients().subscribe({
			error: (err) => {
				this.errorMessage = "Unable to load clients. " + this.getErrorText(err);
			},
		});

		this.sharedStateService.clients$.subscribe({
			next: (clients) => {
				this.clients = clients;
			},
		});
	}

	initIpEntries() {
		this.sharedStateService.loadIpAssets().subscribe({
			error: (err) => {
				this.errorMessage =
					"Unable to load IP entries. " + this.getErrorText(err);
			},
		});

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
			? this.sharedStateService.updateIpAsset(payload)
			: this.sharedStateService.createIpAsset(payload);

		// when request has finished, make not busy to free up the form
		// on success reset form, on error show error message
		req.pipe(finalize(() => (this.busy = false))).subscribe({
			next: () => {
				this.editing = null;
				this.editingEntry = null;
			},
			error: (err) => {
				this.formErrorMessage =
					"Unable to save IP entry. " + this.getErrorText(err);
			},
		});
	}

	onDelete(entry: IpEntry): void {
		this.errorMessage = "";
		this.sharedStateService.deleteIpAsset(entry.InternalReference).subscribe({
			error: (err) => {
				this.errorMessage =
					"Unable to delete IP entry. " + this.getErrorText(err);
			},
		});
	}

	private getErrorText(err: unknown): string {
		// try to extract error message from error response
		if (
			typeof err === "object" &&
			err !== null &&
			"error" in err &&
			typeof (err as { error?: unknown }).error === "string"
		) {
			return (err as { error: string }).error;
		}

		if (
			typeof err === "object" &&
			err !== null &&
			"message" in err &&
			typeof (err as { message?: unknown }).message === "string"
		) {
			return (err as { message: string }).message;
		}

		return "Please try again.";
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
