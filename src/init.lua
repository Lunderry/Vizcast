--!strict
export type Vizcast = {
	VisualizePart: Part,
	Update: (self: Vizcast, origin: Vector3, hit: Vector3, param: RaycastParams?) -> RaycastResult,
	Clone: (self: Vizcast, color: Color3?) -> (),
	ChangeColor: (self: Vizcast, color: Color3) -> (),
	Temporary: (self: Vizcast, origin: Vector3, hit: Vector3, param: RaycastParams?) -> RaycastResult,
	Destroy: (self: Vizcast) -> (),
}

local RunService = game:GetService("RunService")
--
local module = {}

local trash = Instance.new("Folder", workspace.Terrain)
trash.Name = "VizcastClone"

function module.new(Disabled: boolean?): Vizcast
	Disabled = if Disabled then Disabled else false

	local vizcast = { VisualizePart = Instance.new("Part") } :: Vizcast

	vizcast.VisualizePart.Anchored = true
	vizcast.VisualizePart.CanCollide = false
	vizcast.VisualizePart.CanQuery = false
	vizcast.VisualizePart.CanTouch = false
	vizcast.VisualizePart.Parent = trash

	function vizcast:Update(origin: Vector3, hit: Vector3, param: RaycastParams?): RaycastResult
		local ray = workspace:Raycast(origin, hit, param)

		if Disabled == true then
			return ray
		end

		local hitO

		if typeof(hit) == "Vector3" then
			hitO = hit + origin
		else
			hitO = hit
		end

		if ray then
			hitO = ray.Position
			self.VisualizePart.Color = Color3.fromRGB(0, 255, 0)
		else
			self.VisualizePart.Color = Color3.fromRGB(255, 0, 0)
		end

		local sz = (origin - hitO).Magnitude
		self.VisualizePart.Size = Vector3.new(0.1, 0.1, sz)
		self.VisualizePart.CFrame = CFrame.lookAt(origin, hitO) * CFrame.new(0, 0, -sz / 2)

		return ray
	end

	function vizcast:Clone(color: Color3?): ()
		if not RunService:IsStudio() then
			return
		end
		local p = self.VisualizePart:Clone()
		p.Parent = workspace
		p.Color = if color then color else self.VisualizePart.Color
	end

	function vizcast:ChangeColor(color: Color3): ()
		self.VisualizePart.Color = color
	end

	function vizcast:Destroy(): ()
		self.VisualizePart:Destroy()
		table.clear(self)
	end

	function vizcast:Temporary(origin: Vector3, hit: Vector3, param: RaycastParams?): RaycastResult
		local ray = self:Update(origin, hit, param)
		task.delay(0, function()
			self.VisualizePart.Position = Vector3.one * 100
		end)
		return ray
	end

	return vizcast
end

function module.Multiple(size: number, Disabled: boolean?): { Vizcast }
	local tb = {}
	for _ = 1, size do
		tb[#tb + 1] = module.new(Disabled)
	end
	return tb
end

function module.Clean()
	trash:ClearAllChildren()
end

return module
