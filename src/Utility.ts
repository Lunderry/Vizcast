export function FindFirstChildOrCreate(obj: Instance, name: string, className: keyof CreatableInstances): Instance {
	let child = obj.FindFirstChild(name);
	if (child !== undefined) {
		return child;
	}

	child = new Instance(className);
	child.Name = name;
	child.Parent = obj;

	return child;
}

export function FindFirstChild<T extends Instance, K extends keyof T>(obj: T, childName: string): T[K] | undefined {
	const child = obj.FindFirstChild(childName as string);
	if (child !== undefined) {
		return child as T[K];
	}
	return undefined;
}

type getChildren<T> = T extends { [key: number]: infer U } ? U : Instance;
export function ChildrenForEach<T extends Instance>(obj: T, callback: (v: getChildren<T>, i?: number) => void) {
	const children = obj.GetChildren() as Array<getChildren<T>>;
	children.forEach(callback);
}
