export type IpEntryType = "Unknown" | "Patent" | "TradeMark";

export interface IpEntry {
	InternalReference: string;
	Title: string;
	ClientId: string;
	Type: IpEntryType;
	Description: string;
	CreatedAt: string;
}

export interface Client {
	Id: string;
	Name: string;
	StaffId: string;
}
