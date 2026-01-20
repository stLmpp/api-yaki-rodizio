export function mapComputeIfAbsent<K, V>(
	map: Map<K, V>,
	key: K,
	callback: (key: K) => V,
): V {
	let value = map.get(key);
	if (value === undefined) {
		value = callback(key);
		map.set(key, value);
	}
	return value;
}
