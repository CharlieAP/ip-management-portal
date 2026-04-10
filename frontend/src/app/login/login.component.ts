import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.css"],
})
export class LoginComponent {
	form: FormGroup;

	constructor(
		private fb: FormBuilder,
		private auth: AuthService,
	) {
		this.form = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
		});
	}

	submit(): void {
		if (this.form.valid) {
			this.auth.login(this.form.value.email as string);
		}
	}
}
