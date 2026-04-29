import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { IpManagementComponent } from "./ip-management/ip-management.component";

export const routes: Routes = [
	{ path: "", component: LoginComponent },
	{ path: "ips", component: IpManagementComponent },
	{ path: "**", redirectTo: "" },
];
