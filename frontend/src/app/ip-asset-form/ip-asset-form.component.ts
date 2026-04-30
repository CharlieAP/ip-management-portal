import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, Validators } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

export type IpAssetFormMode = "create" | "update";

// Create types for this component to own; decoupling it from API model
export type IpAssetFormType = "Unknown" | "Patent" | "TradeMark";

export interface IpAssetFormValue {
	internalReference: string;
	clientId: string;
	title: string;
	type: IpAssetFormType;
	description: string;
}

export interface ClientOption {
	id: string;
	label: string;
}

// A component to encapsulate the form in the IP management page.
// Used for both creating and editing IP assets

@Component({
	selector: "app-ip-asset-form",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: "./ip-asset-form.component.html",
	styleUrls: ["./ip-asset-form.component.css"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
// implements OnChanges to reset form values when switching between editing diff IP entries or create/edit mode.
export class IpAssetFormComponent implements OnChanges {
	@Input({ required: true }) clients: ClientOption[] = [];
	// if there is a value passed, assume edit mode. Else, assume create mode.
	@Input() initialValue: IpAssetFormValue | null = null;
	@Input() busy = false;
	@Input() errorMessage = "";

	@Output() save = new EventEmitter<IpAssetFormValue>();
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
						internalReference: v.internalReference ?? "",
						clientId: v.clientId ?? "",
						title: v.title ?? "",
						type: v.type ?? "Unknown",
						description: v.description ?? "",
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

		const mappedFormData: IpAssetFormValue = {
			internalReference: rawInputData.internalReference ?? "",
			clientId: rawInputData.clientId ?? "",
			title: rawInputData.title ?? "",
			type: (rawInputData.type ?? "Unknown") as IpAssetFormValue["type"],
			description: rawInputData.description ?? "",
		};

		this.save.emit(mappedFormData);

		const resetValues: IpAssetFormValue = {
			internalReference: "",
			clientId: "",
			title: "",
			type: "Unknown" as IpAssetFormValue["type"],
			description: "",
		};

		// reset form to empty values but dont emit valueChanges event to avoid loops
		this.form.reset(resetValues, { emitEvent: false });
	}

	onCancel(): void {
		this.cancel.emit();
	}
}
