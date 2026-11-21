const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");
const Category = require("../models/category");

// Lista de campos padrão e permitidos para a query de busca
const defaultProductFields = [
  "id",
  "enabled",
  "name",
  "slug",
  "stock",
  "description",
  "price",
  "price_with_discount",
  "category_ids",
  "images",
  "options",
];
const allowedProductFields = [...defaultProductFields, "use_in_menu"];

// Formata o caminho relativo da imagem para retornar uma URL acessível ao frontend
function formatImagePath(req, imagePath) {
  if (!imagePath) {
    return "/featured-k-swiss.png";
  }
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }
  if (imagePath.startsWith("media/")) {
    return `${req.protocol}://${req.get("host")}/${imagePath}`;
  }
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

// Valida se o objeto de opção possui os campos necessários
function isValidOption(option) {
  if (!option || !option.title || typeof option.title !== "string") {
    return false;
  }
  const values = option.values || option.value;
  return Array.isArray(values) && values.length > 0;
}

const productController = {
  // GET /v1/product/search
  async search(req, res) {
    const { query } = req;
    const badRequest = () => res.status(400).json({ message: "Invalid query parameters" });

    // Valida se os parâmetros que devem ser strings vieram no tipo correto
    const stringParameters = ["limit", "fields", "match", "price-range", "category_ids"];
    const hasInvalidStringType = stringParameters.some(
      (param) => query[param] !== undefined && typeof query[param] !== "string"
    );
    if (hasInvalidStringType) {
      return badRequest();
    }

    if (query.page !== undefined && query.limit !== "-1" && typeof query.page !== "string") {
      return badRequest();
    }

    // Configuração de paginação (padrão limit=12, page=1)
    const limit = query.limit === undefined ? 12 : Number(query.limit);
    const page = limit === -1 || query.page === undefined ? 1 : Number(query.page);
    const requestedFields = query.fields === undefined ? defaultProductFields : query.fields.split(",");

    if (!Number.isInteger(limit) || (limit !== -1 && limit < 1) || !Number.isInteger(page) || page < 1) {
      return badRequest();
    }

    const hasInvalidField = requestedFields.some((field) => !allowedProductFields.includes(field));
    if (hasInvalidField) {
      return badRequest();
    }

    const whereConditions = {};

    // 1. Filtro textual: match (busca por nome ou descrição do produto)
    if (query.match !== undefined) {
      if (!query.match || typeof query.match !== "string") {
        return badRequest();
      }
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${query.match}%` } },
        { description: { [Op.like]: `%${query.match}%` } },
      ];
    }

    // 2. Filtro de preço: price-range (formato min-max)
    if (query["price-range"] !== undefined) {
      const priceRangeMatch = query["price-range"].match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
      if (!priceRangeMatch) {
        return badRequest();
      }
      const minPrice = Number(priceRangeMatch[1]);
      const maxPrice = Number(priceRangeMatch[2]);
      if (minPrice > maxPrice) {
        return badRequest();
      }
      whereConditions.price = { [Op.between]: [minPrice, maxPrice] };
    }

    // Conjuntos de IDs filtrados por relacionamentos (categorias e opções)
    const matchingProductIdsSets = [];

    // 3. Filtro por categorias: category_ids (ex: 1,2,3)
    if (query.category_ids !== undefined) {
      const categoryIds = query.category_ids.split(",").map(Number);
      const hasInvalidCategoryId = !categoryIds.length || categoryIds.some((id) => !Number.isInteger(id) || id < 1);
      if (hasInvalidCategoryId) {
        return badRequest();
      }

      const productCategoryRecords = await ProductCategory.findAll({
        attributes: ["product_id"],
        where: { category_id: { [Op.in]: categoryIds } },
        raw: true,
      });

      const productIdsWithCategories = new Set(
        productCategoryRecords.map((record) => record.product_id)
      );
      matchingProductIdsSets.push(productIdsWithCategories);
    }

    // 4. Filtro por opções: option[id]=valor1,valor2
    const optionKeys = Object.keys(query).filter((key) => key.startsWith("option["));
    for (const key of optionKeys) {
      const optionKeyMatch = key.match(/^option\[(\d+)\]$/);
      if (!optionKeyMatch || typeof query[key] !== "string") {
        return badRequest();
      }

      const optionId = Number(optionKeyMatch[1]);
      const optionValues = query[key].split(",");
      if (optionId < 1 || optionValues.some((value) => !value)) {
        return badRequest();
      }

      // Procura por valores separados por vírgula na coluna values
      const likePatterns = optionValues.flatMap((value) => [
        value,
        `${value},%`,
        `%,${value},%`,
        `%,${value}`,
      ]);

      const matchingOptionRecords = await ProductOption.findAll({
        attributes: ["product_id"],
        where: {
          id: optionId,
          [Op.or]: likePatterns.map((pattern) => ({ values: { [Op.like]: pattern } })),
        },
        raw: true,
      });

      const productIdsWithOption = new Set(
        matchingOptionRecords.map((record) => record.product_id)
      );
      matchingProductIdsSets.push(productIdsWithOption);
    }

    // Se houve filtros por categoria ou opção, aplica a interseção dos IDs no where
    if (matchingProductIdsSets.length > 0) {
      const [firstSet, ...remainingSets] = matchingProductIdsSets;
      const intersectedProductIds = [...firstSet].filter((productId) =>
        remainingSets.every((set) => set.has(productId))
      );
      whereConditions.id = { [Op.in]: intersectedProductIds };
    }

    // Separa campos diretos da tabela de produtos dos campos de relacionamento
    const directModelFields = requestedFields.filter(
      (field) => !["category_ids", "images", "options"].includes(field)
    );

    const includeRelations = [];
    if (requestedFields.includes("images")) {
      includeRelations.push({
        model: ProductImage,
        as: "ProductImages",
        attributes: ["id", "path"],
      });
    }
    if (requestedFields.includes("options")) {
      includeRelations.push({
        model: ProductOption,
        as: "ProductOptions",
        attributes: ["id", "title", "shape", "radius", "type", "values"],
      });
    }
    if (requestedFields.includes("category_ids")) {
      includeRelations.push({
        model: Category,
        as: "Categories",
        attributes: ["id"],
        through: { attributes: [] },
      });
    }

    const queryOptions = {
      where: whereConditions,
      attributes: directModelFields.length ? directModelFields : ["id"],
      include: includeRelations,
      distinct: true,
      order: [["id", "ASC"]],
    };

    if (limit !== -1) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    const { count, rows } = await Product.findAndCountAll(queryOptions);

    // Formata a resposta com os dados solicitados
    const formattedData = rows.map((row) => {
      const product = row.get({ plain: true });
      const productItem = {};

      for (const field of directModelFields) {
        productItem[field] = product[field];
      }

      if (requestedFields.includes("images")) {
        const imagesList = product.ProductImages || [];
        productItem.images = imagesList.map((image) => ({
          id: image.id,
          content: formatImagePath(req, image.path),
        }));
      }

      if (requestedFields.includes("options")) {
        productItem.options = product.ProductOptions || [];
      }

      if (requestedFields.includes("category_ids")) {
        const categoriesList = product.Categories || [];
        productItem.category_ids = categoriesList.map((category) => category.id);
      }

      return productItem;
    });

    return res.status(200).json({
      data: formattedData,
      total: count,
      limit,
      page,
    });
  },

  // GET /v1/product/:id
  async getById(req, res) {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: "ProductImages",
          attributes: ["id", "path"],
        },
        {
          model: ProductOption,
          as: "ProductOptions",
          attributes: ["id", "title", "shape", "radius", "type", "values"],
        },
        {
          model: Category,
          as: "Categories",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productData = product.get({ plain: true });
    const productImages = productData.ProductImages || [];
    const productCategories = productData.Categories || [];

    return res.status(200).json({
      id: productData.id,
      enabled: productData.enabled,
      name: productData.name,
      slug: productData.slug,
      stock: productData.stock,
      description: productData.description,
      price: productData.price,
      price_with_discount: productData.price_with_discount,
      category_ids: productCategories.map((category) => category.id),
      images: productImages.map((image) => ({
        id: image.id,
        content: formatImagePath(req, image.path),
      })),
      options: productData.ProductOptions || [],
    });
  },

  // POST /v1/product
  async create(req, res) {
    const {
      enabled, name, slug, stock, description, price, price_with_discount,
      category_ids = [], images = [], options = [],
    } = req.body || {};

    // Valida campos obrigatórios
    if (
      !name ||
      !slug ||
      typeof name !== "string" ||
      typeof slug !== "string" ||
      typeof price !== "number" ||
      typeof price_with_discount !== "number" ||
      !Array.isArray(category_ids) ||
      !Array.isArray(images) ||
      !Array.isArray(options) ||
      !options.every((opt) => opt && opt.title && Array.isArray(opt.values || opt.value))
    ) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    // Valida se todas as categorias informadas existem no banco
    const existingCategories = await Category.findAll({
      attributes: ["id"],
      where: { id: { [Op.in]: category_ids } },
      raw: true,
    });
    if (existingCategories.length !== category_ids.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const transaction = await sequelize.transaction();

    try {
      // 1. Cria o registro do produto
      const createdProduct = await Product.create(
        {
          enabled,
          name,
          slug,
          stock,
          description,
          price,
          price_with_discount,
        },
        { transaction }
      );

      // 2. Salva as imagens enviadas em base64 e grava no banco
      if (images.length > 0) {
        const productMediaDirectory = path.join(
          __dirname,
          "../../media/products",
          String(createdProduct.id)
        );
        await fs.mkdir(productMediaDirectory, { recursive: true });

        for (let index = 0; index < images.length; index++) {
          const imageItem = images[index];
          const extension = imageItem.type === "image/png" ? "png" : "jpg";
          const fileName = `image-${index + 1}.${extension}`;
          const filePath = path.join(productMediaDirectory, fileName);

          await fs.writeFile(filePath, Buffer.from(imageItem.content, "base64"));
          await ProductImage.create(
            {
              product_id: createdProduct.id,
              path: `media/products/${createdProduct.id}/${fileName}`,
            },
            { transaction }
          );
        }
      }

      // 3. Salva as opções do produto (tamanhos, cores, etc.)
      for (const optionItem of options) {
        const optionValues = (optionItem.values || optionItem.value || []).join(",");
        const radiusValue =
          typeof optionItem.radius === "string"
            ? parseInt(optionItem.radius, 10)
            : optionItem.radius || 0;

        await ProductOption.create(
          {
            product_id: createdProduct.id,
            title: optionItem.title,
            shape: optionItem.shape || "square",
            radius: radiusValue,
            type: optionItem.type || "text",
            values: optionValues,
          },
          { transaction }
        );
      }

      // 4. Associa as categorias ao produto
      for (const categoryId of category_ids) {
        await ProductCategory.create(
          {
            product_id: createdProduct.id,
            category_id: categoryId,
          },
          { transaction }
        );
      }

      await transaction.commit();
      return res.status(201).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // PUT /v1/product/:id
  async update(req, res) {
    const {
      enabled, name, slug, stock, description, price, price_with_discount,
      category_ids = [], images = [], options = [],
    } = req.body || {};

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      !name ||
      !slug ||
      typeof name !== "string" ||
      typeof slug !== "string" ||
      typeof price !== "number" ||
      typeof price_with_discount !== "number" ||
      !Array.isArray(category_ids) ||
      !Array.isArray(images) ||
      !Array.isArray(options)
    ) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    // Valida se todas as categorias informadas existem
    const existingCategories = await Category.findAll({
      attributes: ["id"],
      where: { id: { [Op.in]: category_ids } },
      raw: true,
    });
    if (existingCategories.length !== category_ids.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const imageIds = images.map((image) => image.id).filter(Boolean);
    const optionIds = options.map((option) => option.id).filter(Boolean);

    const existingImages = await ProductImage.findAll({
      where: { product_id: product.id, id: imageIds },
    });
    const existingOptions = await ProductOption.findAll({
      where: { product_id: product.id, id: optionIds },
    });

    const transaction = await sequelize.transaction();

    try {
      // 1. Atualiza dados básicos do produto
      await product.update(
        {
          enabled,
          name,
          slug,
          stock,
          description,
          price,
          price_with_discount,
        },
        { transaction }
      );

      // 2. Atualiza vínculos de categorias
      await ProductCategory.destroy({
        where: { product_id: product.id },
        transaction,
      });
      if (category_ids.length > 0) {
        await ProductCategory.bulkCreate(
          category_ids.map((categoryId) => ({
            product_id: product.id,
            category_id: categoryId,
          })),
          { transaction }
        );
      }

      // 3. Atualiza ou adiciona imagens
      for (let index = 0; index < images.length; index++) {
        const imageItem = images[index];
        const currentImageRecord = existingImages.find((record) => record.id === imageItem.id);

        if (imageItem.deleted) {
          if (currentImageRecord) {
            await currentImageRecord.destroy({ transaction });
          }
          continue;
        }

        let savedPath = imageItem.content;
        if (imageItem.content && !/^https?:\/\//.test(imageItem.content)) {
          const productMediaDirectory = path.join(
            __dirname,
            "../../media/products",
            String(product.id)
          );
          const extension = imageItem.type === "image/png" ? "png" : "jpg";
          const fileName = `image-${Date.now()}-${index + 1}.${extension}`;
          const filePath = path.join(productMediaDirectory, fileName);

          await fs.mkdir(productMediaDirectory, { recursive: true });
          await fs.writeFile(filePath, Buffer.from(imageItem.content, "base64"));
          savedPath = `media/products/${product.id}/${fileName}`;
        }

        if (currentImageRecord) {
          await currentImageRecord.update({ path: savedPath }, { transaction });
        } else {
          await ProductImage.create(
            { product_id: product.id, path: savedPath },
            { transaction }
          );
        }
      }

      // 4. Atualiza ou adiciona opções
      for (const optionItem of options) {
        const currentOptionRecord = existingOptions.find((record) => record.id === optionItem.id);

        if (optionItem.deleted) {
          if (currentOptionRecord) {
            await currentOptionRecord.destroy({ transaction });
          }
          continue;
        }

        const optionValues = (optionItem.values || optionItem.value || []).join(",");
        const radiusValue =
          typeof optionItem.radius === "string"
            ? parseInt(optionItem.radius, 10)
            : optionItem.radius;

        const optionDataToSave = {
          ...(optionItem.title !== undefined && { title: optionItem.title }),
          ...(optionItem.shape !== undefined && { shape: optionItem.shape }),
          ...(radiusValue !== undefined && { radius: radiusValue }),
          ...(optionItem.type !== undefined && { type: optionItem.type }),
          ...(optionValues !== undefined && { values: optionValues }),
        };

        if (currentOptionRecord) {
          await currentOptionRecord.update(optionDataToSave, { transaction });
        } else {
          await ProductOption.create(
            { ...optionDataToSave, product_id: product.id },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // DELETE /v1/product/:id
  async delete(req, res) {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const transaction = await sequelize.transaction();

    try {
      const deleteCondition = { product_id: product.id };
      await ProductCategory.destroy({ where: deleteCondition, transaction });
      await ProductImage.destroy({ where: deleteCondition, transaction });
      await ProductOption.destroy({ where: deleteCondition, transaction });
      await product.destroy({ transaction });

      await transaction.commit();
      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = productController;
