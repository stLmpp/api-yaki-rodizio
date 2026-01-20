import { ConstraintType } from '../../domain/constraint-type.js';
import { errorsSchemas } from '../core/errors.schemas.js';
import { type } from 'arktype';
import { createRoute } from '../core/create-route.js';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { mapComputeIfAbsent } from '../../lib/map-upsert.js';

export const getCategoryProductTree = createRoute().get(
	'/categories-tree',
	async ({ db }) => {
		const productConstraintConstraintAlias = alias(
			db.schema.constraint,
			'product_constraint_constraint',
		);
		const results = await db
			.select({
				productCategory: {
					productCategoryId: db.schema.productCategory.productCategoryId,
					productCategoryName: db.schema.productCategory.productCategoryName,
				},
				product: {
					productId: db.schema.product.productId,
					productName: db.schema.product.productName,
					productDescription: db.schema.product.productDescription,
					productCategoryId: db.schema.product.productCategoryId,
				},
				productConstraint: {
					constraintId: db.schema.productConstraint.constraintId,
					productId: db.schema.productConstraint.productId,
				},
				productCategoryConstraint: {
					constraintId: db.schema.productCategoryConstraint.constraintId,
					productCategoryId:
						db.schema.productCategoryConstraint.productCategoryId,
				},
				constraintProduct: {
					constraintId: db.schema.constraint.constraintId,
					constraintType: db.schema.constraint.constraintType,
					constraintValue: db.schema.constraint.constraintValue,
				},
				constraintProductCategory: {
					constraintId: productConstraintConstraintAlias.constraintId,
					constraintType: productConstraintConstraintAlias.constraintType,
					constraintValue: productConstraintConstraintAlias.constraintValue,
				},
			})
			.from(db.schema.productCategory)
			.innerJoin(
				db.schema.product,
				and(
					eq(
						db.schema.product.productCategoryId,
						db.schema.productCategory.productCategoryId,
					),
					isNull(db.schema.product.deletedAt),
				),
			)
			.leftJoin(
				db.schema.productConstraint,
				and(
					eq(
						db.schema.productConstraint.productId,
						db.schema.product.productId,
					),
					isNull(db.schema.productConstraint.deletedAt),
				),
			)
			.leftJoin(
				db.schema.constraint,
				and(
					eq(
						db.schema.constraint.constraintId,
						db.schema.productConstraint.constraintId,
					),
					isNull(db.schema.constraint.deletedAt),
				),
			)
			.leftJoin(
				db.schema.productCategoryConstraint,
				and(
					eq(
						db.schema.productCategoryConstraint.productCategoryId,
						db.schema.productCategory.productCategoryId,
					),
					isNull(db.schema.productCategoryConstraint.deletedAt),
				),
			)
			.leftJoin(
				productConstraintConstraintAlias,
				and(
					eq(
						productConstraintConstraintAlias.constraintId,
						db.schema.productCategoryConstraint.constraintId,
					),
					isNull(productConstraintConstraintAlias.deletedAt),
				),
			)
			.where(and(isNull(db.schema.productCategory.deletedAt)))
			.orderBy(
				asc(db.schema.productCategory.productCategoryId),
				asc(db.schema.product.productId),
			);
		const mapProduct = Map.groupBy(
			results,
			(result) => result.product.productCategoryId,
		);
		const mapProductConstraint = Map.groupBy(
			results,
			(result) => result.productConstraint?.productId,
		);
		const mapProductCategoryConstraint = Map.groupBy(
			results,
			(result) => result.productCategoryConstraint?.productCategoryId,
		);
		for (const result of results) {
			const array = mapComputeIfAbsent(
				mapProduct,
				result.product.productCategoryId,
				() => [],
			);
			array.push(result);
			// TODO
		}
		return {
			productCategories: [...mapProduct]
				.map(([, products]) => {
					const category = products.at(0);
					if (!category) {
						return null;
					}
					const productCategoryConstraints = mapProductCategoryConstraint.get(
						category.productCategory.productCategoryId,
					);
					const categoryMin = productCategoryConstraints?.find(
						({ constraintProductCategory }) =>
							constraintProductCategory?.constraintType === ConstraintType.Min,
					);
					const categoryMax = productCategoryConstraints?.find(
						({ constraintProductCategory }) =>
							constraintProductCategory?.constraintType === ConstraintType.Max,
					);
					return {
						productCategoryId: category.productCategory.productCategoryId,
						productCategoryName: category.productCategory.productCategoryName,
						maxQuantity:
							categoryMax?.constraintProductCategory?.constraintValue.max ??
							undefined,
						minQuantity:
							categoryMin?.constraintProductCategory?.constraintValue.min ??
							undefined,
						products: products.map((product) => {
							const productConstraints = mapProductConstraint.get(
								product.product.productId,
							);
							const productMin = productConstraints?.find(
								({ constraintProduct }) =>
									constraintProduct?.constraintType === ConstraintType.Min,
							);
							const productMax = productConstraints?.find(
								({ constraintProduct }) =>
									constraintProduct?.constraintType === ConstraintType.Max,
							);
							return {
								productId: product.product.productId,
								productName: product.product.productName,
								maxQuantity:
									productMax?.constraintProduct?.constraintValue.max ??
									undefined,
								minQuantity:
									productMin?.constraintProduct?.constraintValue.min ??
									undefined,
							};
						}),
					};
				})
				.filter((value) => value !== null),
		};
		// const categories = await db.query.productCategory.findMany({
		// 	columns: {
		// 		productCategoryId: true,
		// 		productCategoryName: true,
		// 	},
		// 	where: {
		// 		deletedAt: { isNull: true },
		// 		products: {
		// 			deletedAt: { isNull: true },
		// 			productConstraints: {
		// 				deletedAt: { isNull: true },
		// 				constraint: {
		// 					deletedAt: { isNull: true },
		// 				},
		// 			},
		// 		},
		// 		productCategoryConstraints: {
		// 			deletedAt: { isNull: true },
		// 			constraint: {
		// 				deletedAt: { isNull: true },
		// 			},
		// 		},
		// 	},
		// 	with: {
		// 		productCategoryConstraints: {
		// 			columns: {},
		// 			with: {
		// 				constraint: {
		// 					columns: {
		// 						constraintType: true,
		// 						constraintValue: true,
		// 					},
		// 				},
		// 			},
		// 		},
		// 		products: {
		// 			columns: {
		// 				productId: true,
		// 				productName: true,
		// 				productDescription: true,
		// 			},
		// 			with: {
		// 				productConstraints: {
		// 					columns: {},
		// 					with: {
		// 						constraint: {
		// 							columns: {
		// 								constraintType: true,
		// 								constraintValue: true,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 			orderBy: { productId: 'asc' },
		// 		},
		// 	},
		// 	orderBy: {
		// 		productCategoryId: 'asc',
		// 	},
		// });
		// return {
		// 	productCategories: categories.map((category) => {
		// 		const maxQuantity = category.productCategoryConstraints.find(
		// 			(constraint) =>
		// 				constraint.constraint.constraintType === ConstraintType.Max,
		// 		);
		// 		const minQuantity = category.productCategoryConstraints.find(
		// 			(constraint) =>
		// 				constraint.constraint.constraintType === ConstraintType.Min,
		// 		);
		// 		return {
		// 			productCategoryId: category.productCategoryId,
		// 			productCategoryName: category.productCategoryName,
		// 			maxQuantity: maxQuantity?.constraint.constraintValue.max,
		// 			minQuantity: minQuantity?.constraint.constraintValue.min,
		// 			products: category.products.map((product) => {
		// 				const maxQuantity = product.productConstraints.find(
		// 					(constraint) =>
		// 						constraint.constraint.constraintType === ConstraintType.Max,
		// 				);
		// 				const minQuantity = product.productConstraints.find(
		// 					(constraint) =>
		// 						constraint.constraint.constraintType === ConstraintType.Min,
		// 				);
		// 				return {
		// 					productId: product.productId,
		// 					productName: product.productName,
		// 					productDescription: product.productDescription ?? undefined,
		// 					maxQuantity: maxQuantity?.constraint.constraintValue.max,
		// 					minQuantity: minQuantity?.constraint.constraintValue.min,
		// 				};
		// 			}),
		// 		};
		// 	}),
		// };
	},
	{
		auth: true,
		response: {
			...errorsSchemas,
			200: type({
				productCategories: type({
					productCategoryId: 'bigint',
					productCategoryName: 'string',
					'maxQuantity?': 'number.integer',
					'minQuantity?': 'number.integer',
					products: type({
						productId: 'bigint',
						productName: 'string',
						'productDescription?': 'string',
						'maxQuantity?': 'number.integer',
						'minQuantity?': 'number.integer',
					}).array(),
				}).array(),
			}),
		},
	},
);
