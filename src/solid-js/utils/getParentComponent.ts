import Computation from "../types/Computation";

export default function getParentComponent(
	owner: Computation
): Computation | null {
	let parent: Computation | null = owner.owner as Computation;
	while (parent) {
		if (parent.componentName) {
			return parent;
		}
		parent = parent.owner as Computation;
	}
	return null;
}
