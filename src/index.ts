import { Workspace } from "@rbxts/services";
import { MainFolder, Vizcast, VizcastFolder, VizualizePart } from "./Types.d";
import { FindFirstChild, FindFirstChildOrCreate } from "./Utility";

const folderTrash = FindFirstChildOrCreate(Workspace.Terrain, "Vizcast", "Folder");

function getComplementaryColor(color: Color3): Color3 {
	const r = 1 - color.R;
	const g = 1 - color.G;
	const b = 1 - color.B;
	return new Color3(r, g, b);
}

export default class VizcastImp implements Vizcast {
	MainFolder;
	VizcastFolder;
	CloneFolder;
	VizualizeBlock;
	VizualizeSphere;
	haveHighlight = false;

	HitColor = Color3.fromRGB(0, 255, 0);
	NoHitColor = Color3.fromRGB(255, 0, 0);

	constructor(highlight = true, disabled = false) {
		this.haveHighlight = highlight;

		if (disabled === false) {
			{
				this.MainFolder = new Instance("Folder") as MainFolder;
				this.MainFolder.Name = "Main";
				this.MainFolder.Parent = folderTrash;

				this.VizcastFolder = new Instance("Folder") as VizcastFolder;
				this.VizcastFolder.Name = "VizcastFolder";
				this.VizcastFolder.Parent = this.MainFolder;

				this.CloneFolder = new Instance("Folder") as VizcastFolder;
				this.CloneFolder.Name = "CloneFolder";
				this.CloneFolder.Parent = this.MainFolder;
			}

			for (let i = 0; i < 2; i++) {
				const part = new Instance("Part");
				part.Position = Vector3.one.mul(100);
				part.Anchored = true;
				part.CanCollide = false;
				part.CanQuery = false;
				part.CanTouch = false;
				part.Locked = true;
				part.Material = Enum.Material.SmoothPlastic;
				part.Parent = this.VizcastFolder;
				part.Transparency = 0.5;
				if (i === 1) {
					part.Shape = Enum.PartType.Ball;
					this.VizualizeSphere = part;
				} else {
					this.VizualizeBlock = part;
				}
			}
		}

		if (this.haveHighlight && this.VizualizeBlock && this.VizualizeSphere) {
			for (let i = 0; i < 2; i++) {
				const hg = new Instance("Highlight");
				hg.Adornee = this.VizualizeBlock;
				hg.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop;
				hg.OutlineTransparency = 1;
				hg.Enabled = false;

				if (i === 1) {
					hg.Parent = this.VizualizeSphere;
				} else {
					hg.Parent = this.VizualizeBlock;
				}
			}
		}
	}

	static Multiple(size: number, highlight = true, disabled = false): Vizcast[] {
		const vz = [];

		for (let i = 0; i < size; i++) {
			vz.push(new VizcastImp(highlight, disabled));
		}
		return vz;
	}

	private colorSelect(vizualizePart: VizualizePart, ray: RaycastResult | undefined) {
		const highlight = FindFirstChild(vizualizePart, "Highlight") as Highlight | undefined;
		this.Visible(true, vizualizePart);

		if (ray !== undefined) {
			vizualizePart.Color = this.HitColor;
			if (highlight) {
				highlight.FillColor = this.HitColor;
			}
		} else {
			vizualizePart.Color = this.NoHitColor;

			if (highlight) {
				highlight.FillColor = this.NoHitColor;
			}
		}
	}

	Visible(b: boolean, vizualizePart?: VizualizePart) {
		if (vizualizePart !== undefined) {
			const highlight = FindFirstChild(vizualizePart, "Highlight") as Highlight | undefined;
			if (highlight) {
				highlight.Enabled = b;
			}
			vizualizePart.Transparency = b === true ? 0.5 : 1;
		} else if (this.VizcastFolder !== undefined) {
			this.VizcastFolder.GetChildren().forEach((vp) => {
				const vizualizePart = vp as VizualizePart;

				const highlight = FindFirstChild(vizualizePart, "Highlight") as Highlight | undefined;
				if (highlight) {
					highlight.Enabled = b;
				}
				vizualizePart.Transparency = b === true ? 0.5 : 1;
			});
		}
	}
	ChangeColor(color: Color3): void {
		this.HitColor = color;
		this.NoHitColor = getComplementaryColor(color);
	}

	UpdateRay(
		origin: Vector3,
		direction: Vector3,
		rayParam?: RaycastParams,
		temporaryTime = -1,
	): RaycastResult | undefined {
		const ray = Workspace.Raycast(origin, direction, rayParam);

		if (this.VizualizeBlock !== undefined) {
			this.colorSelect(this.VizualizeBlock, ray);

			let rayDirection;

			if (ray) {
				rayDirection = ray.Position;
			} else {
				rayDirection = direction.add(origin);
			}
			const large = origin.sub(rayDirection).Magnitude;

			this.VizualizeBlock.Size = new Vector3(0.1, 0.1, large);
			this.VizualizeBlock.CFrame = CFrame.lookAt(origin, rayDirection).mul(new CFrame(0, 0, -large / 2));

			if (temporaryTime >= 0) {
				task.delay(temporaryTime, () => {
					this.Visible(false, this.VizualizeBlock);
				});
			}
		}
		return ray;
	}

	UpdateBlock(
		cframe: CFrame,
		size: Vector3,
		direction: Vector3,
		rayParam?: RaycastParams,
		temporaryTime = -1,
	): RaycastResult | undefined {
		const ray = Workspace.Blockcast(cframe, size, direction, rayParam);

		if (this.VizualizeBlock !== undefined) {
			this.colorSelect(this.VizualizeBlock, ray);

			this.VizualizeBlock.Size = size;
			this.VizualizeBlock.CFrame = new CFrame(cframe.Position.add(direction)).mul(cframe.Rotation);

			if (temporaryTime >= 0) {
				task.delay(temporaryTime, () => {
					this.Visible(false, this.VizualizeBlock);
				});
			}
		}
		return ray;
	}
	UpdateSphere(
		origin: Vector3,
		radius: number,
		direction = Vector3.zero,
		rayParam?: RaycastParams,
		temporaryTime = -1,
	): RaycastResult | undefined {
		const ray = Workspace.Spherecast(origin, radius, direction, rayParam);

		if (this.VizualizeSphere !== undefined) {
			this.colorSelect(this.VizualizeSphere, ray);

			this.VizualizeSphere.Size = Vector3.one.mul(radius * 2);
			this.VizualizeSphere.Position = origin.add(direction);

			if (temporaryTime >= 0) {
				task.delay(temporaryTime, () => {
					this.Visible(false, this.VizualizeSphere);
				});
			}
		}
		return ray;
	}

	Clone(): VizcastFolder | undefined {
		if (this.VizcastFolder === undefined) {
			return;
		}
		const c = this.VizcastFolder.Clone();
		c.Parent = this.CloneFolder;
		return c;
	}

	ClearClone() {
		if (this.CloneFolder) {
			this.CloneFolder.ClearAllChildren();
		}
	}
	Destroy() {
		if (this.MainFolder) {
			this.MainFolder.Destroy();
		}
	}
}
