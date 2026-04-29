import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { IpManagementComponent } from "./ip-management/ip-management.component";
import { IpAssetFormComponent } from "./ip-asset-form-component/ip-asset-form-component.component";

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		IpManagementComponent,
		IpAssetFormComponent,
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
