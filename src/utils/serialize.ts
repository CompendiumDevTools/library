type Intercept = (node: any) => boolean | void;

const noResult = Symbol("noResult");

function cereal(node: any, intercept: Intercept) {
	if (intercept != null) {
		const interceptResult = intercept(node);
		if (typeof interceptResult === "object") {
			return interceptResult;
		}
	} else if (node instanceof RegExp) {
		return {
			type: "RegExp",
			value: node.toString(),
			color: "rgb(53, 212, 199)",
		};
	} else if (node instanceof Date) {
		return {
			type: "Date",
			value: node.toISOString(),
			color: "rgb(53, 212, 199)",
		};
	} else if (node instanceof Map) {
		return {
			type: `Map(${node.size})`,
			value: serialize(Object.fromEntries(node.entries())),
			color: "rgb(154, 160, 166)",
		};
	} else if (node instanceof Set) {
		return {
			type: `Set(${node.size})`,
			value: serialize([...node]),
			color: "rgb(154, 160, 166)",
		};
	} else if (node instanceof Function) {
		let functionString = node.toString();
		if (functionString.length > 100) {
			if (node.name.length > 0) {
				functionString = `function ${node.name}() { ... }`;
			} else {
				functionString = `() => { ... }`;
			}
		}
		return {
			type: "Function",
			value: functionString,
			color: "hsl(252deg 100% 75%)",
		};
	} else if (typeof node === "bigint" || node instanceof BigInt) {
		return {
			type: "BigInt",
			value: `${node.toString()}n`,
			color: "hsl(252deg 100% 75%)",
		};
	} else if (typeof node === "symbol") {
		return {
			type: "Symbol",
			value: node.toString(),
			color: "rgb(53, 212, 199)",
		};
	}

	// Go off of noResult because a user of this library might return a normal type instead of a serialized one.
	// Yes, that's a valid use case.
	return noResult;
}

export default function serialize(node: any, intercept?: Intercept): any {
	const serializedValue = cereal(node, intercept);
	if (serializedValue !== noResult) {
		return {
			$$SERIALIZED_TYPE$$: serializedValue,
		};
	}

	if (
		!(node instanceof Object) ||
		(typeof node === "object" && node.hasOwnProperty("$$SERIALIZED_TYPE$$"))
	) {
		return node;
	}

	const isArray = Array.isArray(node);
	const result = isArray ? [] : {};
	const keys = isArray ? node : Reflect.ownKeys(node);

	for (let i = 0; i < keys.length; i++) {
		const key = isArray ? i : keys[i];
		const value = node[key];

		const serializedValue = cereal(value, intercept);
		if (serializedValue !== noResult) {
			const serializedObject = {
				$$SERIALIZED_TYPE$$: serializedValue,
			};
			if (isArray) {
				(result as any[]).push(serializedObject);
				continue;
			}
			result[key] = serializedObject;
			continue;
		}

		if (isArray) {
			(result as any[]).push(serialize(value, intercept));
			continue;
		}
		result[key] = serialize(value, intercept);
	}

	return result;
}
