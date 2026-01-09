import { createModule } from '../core/create-module.js';
import { ConstraintType } from '../../domain/constraint-type.js';
import { errorsSchemas } from '../core/errors.schemas.js';
import { type } from 'arktype';

export const getProductWithCategoriesTree = createModule().get(
	'/categories-tree',
	async ({ db }) => {
		const categories = await db.query.productCategory.findMany({
			columns: {
				productCategoryId: true,
				productCategoryName: true,
			},
			where: {
				deletedAt: { isNull: true },
				products: {
					deletedAt: { isNull: true },
					productConstraints: {
						deletedAt: { isNull: true },
						constraint: {
							deletedAt: { isNull: true },
						},
					},
				},
				productCategoryConstraints: {
					deletedAt: { isNull: true },
					constraint: {
						deletedAt: { isNull: true },
					},
				},
			},
			with: {
				productCategoryConstraints: {
					columns: {},
					with: {
						constraint: {
							columns: {
								constraintType: true,
								constraintValue: true,
							},
						},
					},
				},
				products: {
					columns: {
						productId: true,
						productName: true,
						productDescription: true,
					},
					with: {
						productConstraints: {
							columns: {},
							with: {
								constraint: {
									columns: {
										constraintType: true,
										constraintValue: true,
									},
								},
							},
						},
					},
					orderBy: { productId: 'asc' },
				},
			},
			orderBy: {
				productCategoryId: 'asc',
			},
		});
		return {
			productCategories: categories.map((category) => {
				const maxQuantity = category.productCategoryConstraints.find(
					(constraint) =>
						constraint.constraint.constraintType === ConstraintType.Max,
				);
				const minQuantity = category.productCategoryConstraints.find(
					(constraint) =>
						constraint.constraint.constraintType === ConstraintType.Min,
				);
				return {
					productCategoryId: category.productCategoryId,
					productCategoryName: category.productCategoryName,
					maxQuantity: maxQuantity?.constraint.constraintValue.max,
					minQuantity: minQuantity?.constraint.constraintValue.min,
					products: category.products.map((product) => {
						const maxQuantity = product.productConstraints.find(
							(constraint) =>
								constraint.constraint.constraintType === ConstraintType.Max,
						);
						const minQuantity = product.productConstraints.find(
							(constraint) =>
								constraint.constraint.constraintType === ConstraintType.Min,
						);
						return {
							productId: product.productId,
							productName: product.productName,
							productDescription: product.productDescription ?? undefined,
							maxQuantity: maxQuantity?.constraint.constraintValue.max,
							minQuantity: minQuantity?.constraint.constraintValue.min,
						};
					}),
				};
			}),
		};
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
