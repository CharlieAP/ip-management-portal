import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IpManagementComponent } from "./ip-management/ip-management.component";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
	{ path: "", component: LoginComponent },
	{ path: "ips", component: IpManagementComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
