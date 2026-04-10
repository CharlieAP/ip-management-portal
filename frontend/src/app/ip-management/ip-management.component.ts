import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
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

	form;

	constructor(
		private fb: FormBuilder,
		private ipService: IpService,
	) {
		this.form = this.fb.group({
			internalReference: ["", Validators.required],
			clientId: ["", Validators.required],
			title: ["", Validators.required],
			type: ["", Validators.required],
			description: [""],
		});
	}

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

	submit(): void {
		if (this.form.invalid) {
			return;
		}
		const payload: IpEntry = {
			InternalReference:
				this.editing?.InternalReference ??
				this.form.value.internalReference ??
				"",
			ClientId: this.form.value.clientId ?? "",
			Title: this.form.value.title ?? "",
			Type: (this.form.value.type ?? "Unknown") as IpEntry["Type"],
			Description: this.form.value.description ?? "",
			CreatedAt: this.editing?.CreatedAt ?? new Date().toISOString(),
		};

		const request = this.editing
			? this.ipService.updateIpEntry(payload)
			: this.ipService.createIpEntry(payload);

		request.subscribe({
			next: () => {
				this.clearForm();
				this.loadData();
			},
			error: () => (this.errorMessage = "Unable to save IP entry."),
		});
	}

	edit(entry: IpEntry): void {
		this.editing = entry;
		this.form.patchValue({
			internalReference: entry.InternalReference,
			clientId: entry.ClientId,
			title: entry.Title,
			type: entry.Type,
			description: entry.Description,
		});
		this.form.get("internalReference")?.disable();
	}

	delete(entry: IpEntry): void {
		this.ipService.deleteIpEntry(entry.InternalReference).subscribe({
			next: () => this.loadData(),
			error: () => (this.errorMessage = "Unable to delete IP entry."),
		});
	}

	getClientName(clientId: string): string {
		// TODO: this is running on every change detection cycle and should be optimised
		const c =
			this.clients.find((c) => c.Id.trim() === clientId.trim())?.Name ?? "";
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

	clearForm(): void {
		this.editing = null;
		this.form.get("internalReference")?.enable();
		this.form.reset({ type: "" });
	}
}
