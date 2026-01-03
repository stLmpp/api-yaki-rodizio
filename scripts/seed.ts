import { reset, seed } from 'drizzle-seed';
import * as dotenv from 'dotenv';
import { createDb } from '../src/database/db.js';
import * as schemas from '../src/database/schemas.js';
import { PgTable } from 'drizzle-orm/pg-core';

dotenv.config();

abstract class AbstractGenerator<T = {}> {
	static readonly entityKind: string = 'AbstractGenerator';
	static readonly version: number = 1;

	public isUnique = false;
	public notNull = false;

	// param for generators which have a unique version of themselves
	public uniqueVersionOfGen?: new (params: T) => AbstractGenerator<T>;

	public dataType?: string;
	public timeSpent?: number;

	//
	public arraySize?: number;
	public baseColumnDataType?: string;

	// param for text-like generators
	public stringLength?: number;

	// params for GenerateValuesFromArray
	public weightedCountSeed?: number | undefined;
	public maxRepeatedValuesCount?:
		| number
		| { weight: number; count: number | number[] }[]
		| undefined;

	public params: T;

	constructor(params?: T) {
		this.params = params === undefined ? ({} as T) : (params as T);
	}

	init(params: {
		count: number | { weight: number; count: number | number[] }[];
		seed: number;
	}): void;
	init() {
		this.updateParams();
	}

	updateParams() {
		if ((this.params as any).arraySize !== undefined) {
			this.arraySize = (this.params as any).arraySize;
		}

		if ((this.params as any).isUnique !== undefined) {
			if ((this.params as any).isUnique === false && this.isUnique === true) {
				throw new Error('specifying non unique generator to unique column.');
			}

			this.isUnique = (this.params as any).isUnique;
		}
	}

	abstract generate(params: {
		i: number;
	}): number | string | boolean | unknown | undefined | void;

	getEntityKind(): string {
		const constructor = this.constructor as typeof AbstractGenerator;
		return constructor.entityKind;
	}

	replaceIfUnique() {
		this.updateParams();
		if (this.uniqueVersionOfGen !== undefined && this.isUnique === true) {
			const uniqueGen = new this.uniqueVersionOfGen({
				...this.params,
			});

			uniqueGen.isUnique = this.isUnique;
			uniqueGen.dataType = this.dataType;

			return uniqueGen;
		}
		return;
	}

	replaceIfArray() {
		this.updateParams();

		return;
	}
}

export class NullGenerator extends AbstractGenerator<{}> {
	static override readonly entityKind: string = 'HollowGenerator';

	override init() {}

	generate() {
		return null;
	}
}

(async () => {
	const { db, client } = createDb(process.env.DATABASE_URL!);
	try {
		await reset(db, schemas);
		await seed(db, schemas, {
			count: 100,
		}).refine((r) => {
			const tables = Object.fromEntries(
				Object.entries(schemas)
					.filter(([, schema]) => schema instanceof PgTable)
					.map(([key]) => [
						key,
						{
							columns: {
								deletedAt: new NullGenerator(),
							},
						},
					]),
			);
			return {
				...tables,
				constraint: {
					...tables.constraint,
					columns: {
						constraintType: r.valuesFromArray({
							values: ['MIN', 'MAX'],
						}),
					},
				},
			};
		});
	} catch (e) {
		throw e;
	} finally {
		await client.end();
	}
})();
