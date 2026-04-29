import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Client, IpEntry } from "../ip.model";

export type IpAssetFormMode = "create" | "update";

// A component to encapsulate the form in the IP management page.
// Used for both creating and editing IP assets

@Component({
	selector: "app-ip-asset-form",
	templateUrl: "./ip-asset-form-component.component.html",
	styleUrls: ["./ip-asset-form-component.component.css"],
	changeDetection: ChangeDetectionStrategy.OnPush,
}) // TODO understand on changes
export class IpAssetFormComponent implements OnChanges {
	@Input({ required: true }) clients: Client[] = [];
	// if there is an IP entry passed, assume edit mode. Else, assume create mode.
	@Input() initialValue: IpEntry | null = null;
	@Input() busy = false;
	@Input() errorMessage = "";

	@Output() save = new EventEmitter<IpEntry>();
	@Output() cancel = new EventEmitter<void>();

	form;

	constructor(private fb: FormBuilder) {
		// initialise form group
		this.form = this.fb.group({
			internalReference: ["", Validators.required],
			clientId: ["", Validators.required],
			title: ["", Validators.required],
			type: ["Unknown", Validators.required],
			description: [""],
		});
	}

	// get labels based on state
	get isEdit(): boolean {
		return !!this.initialValue;
	}

	get heading(): string {
		return this.isEdit ? "Edit IP" : "Add IP";
	}

	get submitLabel(): string {
		return this.isEdit ? "Save" : "Create";
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["initialValue"]) {
			if (this.initialValue) {
				// HAS initial value => update mode
				const v = this.initialValue;

				// pre-populate inputs with existing values from initialValue
				this.form.reset(
					{
						internalReference: v.InternalReference ?? "",
						clientId: v.ClientId ?? "",
						title: v.Title ?? "",
						type: v.Type ?? "Unknown",
						description: v.Description ?? "",
					},
					{
						emitEvent: false,
					},
				);

				// dont allow internal reference to be changed when in update mode
				this.form.get("internalReference")?.disable({
					emitEvent: false,
				});
			} else {
				// DOES NOT have initial value => create mode
				// ensure internal reference is editable
				this.form.get("internalReference")?.enable({
					emitEvent: false,
				});

				this.form.reset(
					{
						internalReference: "",
						clientId: "",
						title: "",
						type: "Unknown",
						description: "",
					},
					{ emitEvent: false },
				);
			}
		}
	}

	onSubmit(): void {
		if (this.busy) return;

		this.form.markAllAsTouched();
		if (this.form.invalid) return;

		const rawInputData = this.form.getRawValue(); // allows getting value of disabled controls

		const mappedFormData: IpEntry = {
			InternalReference:
				this.initialValue?.InternalReference ??
				rawInputData.internalReference ??
				"",
			ClientId: rawInputData.clientId ?? "",
			Title: rawInputData.title ?? "",
			Type: (rawInputData.type ?? "Unknown") as IpEntry["Type"],
			Description: rawInputData.description ?? "",
			CreatedAt: this.initialValue?.CreatedAt ?? new Date().toISOString(),
		};

		this.save.emit(mappedFormData);
	}

	onCancel(): void {
		this.cancel.emit;
	}
}
