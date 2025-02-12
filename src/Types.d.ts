export type VizualizePart = Part & {
	Highlight?: Highlight;
};

interface MainFolder extends Folder {
	VizcastFolder: VizcastFolder;
	CloneFolder: VizcastFolder;
}

interface VizcastFolder extends Folder {
	[key: number]: VizualizePart;
}

export class Vizcast {
	MainFolder?: MainFolder;
	VizcastFolder?: VizcastFolder;
	CloneFolder?: VizcastFolder;

	VizualizeBlock?: VizualizePart;
	VizualizeSphere?: VizualizePart;

	haveHighlight: boolean;
	disabled: boolean;

	HitColor: Color3;
	NoHitColor: Color3;

	constructor(highlight?: boolean, disabled?: boolean);
	static Multiple(size: number, highlight?: boolean, disabled?: boolean): Vizcast[];

	Visible(isVisible: boolean, vizualizePart?: VizualizePart): void;
	ChangeColor(this: Vizcast, color: Color3): void;
	UpdateRay(
		this: Vizcast,
		origin: Vector3,
		direction: Vector3,
		rayParam?: RaycastParams,
		temporaryTime?: number,
	): RaycastResult | undefined;
	UpdateBlock(
		this: Vizcast,
		cframe: CFrame,
		size: Vector3,
		direction: Vector3,
		rayParam?: RaycastParams,
		temporaryTime?: number,
	): RaycastResult | undefined;
	UpdateSphere(
		this: Vizcast,
		origin: Vector3,
		radius: number,
		direction?: Vector3,
		rayParam?: RaycastParams,
		temporaryTime?: number,
	): RaycastResult | undefined;
	Clone(this: Vizcast): void;
	ClearClone(this: Vizcast): void;
	Destroy(this: Vizcast): void;
}
