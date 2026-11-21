const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");
const Category = require("../models/category");

const defaultFields = [
  "id", "enabled", "name", "slug", "stock", "description", "price",
  "price_with_discount", "category_ids", "images", "options",
];
const allowedFields = [...defaultFields, "use_in_menu"];

// Helper para formatar a URL de imagem
function formatImagePath(req, imgPath) {
  if (!imgPath) return "/featured-k-swiss.png";
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  if (imgPath.startsWith("media/")) {
    return `${req.protocol}://${req.get("host")}/${imgPath}`;
  }
  return imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
}

// Validação simples de opções de produto
function isValidOption(opt) {
  if (!opt || !opt.title || typeof opt.title !== "string") return false;
  const values = opt.values || opt.value;
  return Array.isArray(values) && values.length > 0;
}

const productController = {
  // GET /v1/product/search
  async search(req, res) {
    const { query } = req;
    const badRequest = () => res.status(400).json({ message: "Invalid query parameters" });

    // Validações básicas de query params
    const stringParams = ["limit", "fields", "match", "price-range", "category_ids"];
    if (stringParams.some((k) => query[k] !== undefined && typeof query[k] !== "string")) {
      return badRequest();
    }
    if (query.page !== undefined && query.limit !== "-1" && typeof query.page !== "string") {
      return badRequest();
    }

    const limit = query.limit === undefined ? 12 : Number(query.limit);
    const page = limit === -1 || query.page === undefined ? 1 : Number(query.page);
    const fields = query.fields === undefined ? defaultFields : query.fields.split(",");

    if (!Number.isInteger(limit) || (limit !== -1 && limit < 1) || !Number.isInteger(page) || page < 1) {
      return badRequest();
    }
    if (fields.some((f) => !allowedFields.includes(f))) {
      return badRequest();
    }

    const where = {};

    // Filtro por match (nome ou descrição)
    if (query.match !== undefined) {
      if (!query.match || typeof query.match !== "string") return badRequest();
      where[Op.or] = [
        { name: { [Op.like]: `%${query.match}%` } },
        { description: { [Op.like]: `%${query.match}%` } },
      ];
    }

    // Filtro por faixa de preço
    if (query["price-range"] !== undefined) {
      const match = query["price-range"].match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
      if (!match) return badRequest();
      const min = Number(match[1]);
      const max = Number(match[2]);
      if (min > max) return badRequest();
      where.price = { [Op.between]: [min, max] };
    }

    const matchedProductIds = [];

    // Filtro por categorias
    if (query.category_ids !== undefined) {
      const catIds = query.category_ids.split(",").map(Number);
      if (!catIds.length || catIds.some((id) => !Number.isInteger(id) || id < 1)) {
        return badRequest();
      }
      const relations = await ProductCategory.findAll({
        attributes: ["product_id"],
        where: { category_id: { [Op.in]: catIds } },
        raw: true,
      });
      matchedProductIds.push(new Set(relations.map((r) => r.product_id)));
    }

    // Filtro por opções dinâmicas (option[id]=valor1,valor2)
    const optionEntries = Object.entries(query).filter(([k]) => k.startsWith("option["));
    for (const [key, value] of optionEntries) {
      const match = key.match(/^option\[(\d+)\]$/);
      if (!match || typeof value !== "string") return badRequest();

      const optionId = Number(match[1]);
      const values = value.split(",");
      if (optionId < 1 || values.some((v) => !v)) return badRequest();

      const patterns = values.flatMap((v) => [v, `${v},%`, `%,${v},%`, `%,${v}`]);
      const matches = await ProductOption.findAll({
        attributes: ["product_id"],
        where: {
          id: optionId,
          [Op.or]: patterns.map((val) => ({ values: { [Op.like]: val } })),
        },
        raw: true,
      });
      matchedProductIds.push(new Set(matches.map((m) => m.product_id)));
    }

    // Interseção dos filtros de IDs
    if (matchedProductIds.length > 0) {
      const [first, ...rest] = matchedProductIds;
      where.id = {
        [Op.in]: [...first].filter((id) => rest.every((set) => set.has(id))),
      };
    }

    // Monta include com relacionamentos pedidos em fields
    const directFields = fields.filter((f) => !["category_ids", "images", "options"].includes(f));
    const include = [];

    if (fields.includes("images")) {
      include.push({ model: ProductImage, as: "ProductImages", attributes: ["id", "path"] });
    }
    if (fields.includes("options")) {
      include.push({
        model: ProductOption,
        as: "ProductOptions",
        attributes: ["id", "title", "shape", "radius", "type", "values"],
      });
    }
    if (fields.includes("category_ids")) {
      include.push({
        model: Category,
        as: "Categories",
        attributes: ["id"],
        through: { attributes: [] },
      });
    }

    const options = {
      where,
      attributes: directFields.length ? directFields : ["id"],
      include,
      distinct: true,
      order: [["id", "ASC"]],
    };

    if (limit !== -1) {
      options.limit = limit;
      options.offset = (page - 1) * limit;
    }

    const { count, rows } = await Product.findAndCountAll(options);

    const data = rows.map((row) => {
      const p = row.get({ plain: true });
      const item = {};
      directFields.forEach((field) => { item[field] = p[field]; });

      if (fields.includes("images")) {
        item.images = (p.ProductImages || []).map((img) => ({
          id: img.id,
          content: formatImagePath(req, img.path),
        }));
      }
      if (fields.includes("options")) {
        item.options = p.ProductOptions || [];
      }
      if (fields.includes("category_ids")) {
        item.category_ids = (p.Categories || []).map((c) => c.id);
      }
      return item;
    });

    return res.status(200).json({ data, total: count, limit, page });
  },

  // GET /v1/product/:id
  async getById(req, res) {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage, as: "ProductImages", attributes: ["id", "path"] },
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

    const data = product.get({ plain: true });

    return res.status(200).json({
      id: data.id,
      enabled: data.enabled,
      name: data.name,
      slug: data.slug,
      stock: data.stock,
      description: data.description,
      price: data.price,
      price_with_discount: data.price_with_discount,
      category_ids: (data.Categories || []).map((c) => c.id),
      images: (data.ProductImages || []).map((img) => ({
        id: img.id,
        content: formatImagePath(req, img.path),
      })),
      options: data.ProductOptions || [],
    });
  },

  // POST /v1/product
  async create(req, res) {
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids = [],
      images = [],
      options = [],
    } = req.body || {};

    // Validações básicas
    if (
      !name || !slug ||
      typeof name !== "string" || typeof slug !== "string" ||
      typeof price !== "number" || typeof price_with_discount !== "number" ||
      !Array.isArray(category_ids) || !Array.isArray(images) || !Array.isArray(options) ||
      !options.every(isValidOption)
    ) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    // Valida se categorias existem
    const foundCategories = await Category.findAll({
      attributes: ["id"],
      where: { id: { [Op.in]: category_ids } },
      raw: true,
    });
    if (foundCategories.length !== category_ids.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.create(
        { enabled, name, slug, stock, description, price, price_with_discount },
        { transaction },
      );

      // Salva imagens no disco e registra no banco
      if (images.length > 0) {
        const uploadDir = path.join(__dirname, "../../media/products", String(product.id));
        await fs.mkdir(uploadDir, { recursive: true });

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const ext = img.type === "image/png" ? "png" : "jpg";
          const fileName = `image-${i + 1}.${ext}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.writeFile(filePath, Buffer.from(img.content, "base64"));
          await ProductImage.create(
            {
              product_id: product.id,
              path: `media/products/${product.id}/${fileName}`,
            },
            { transaction },
          );
        }
      }

      // Salva opções
      for (const opt of options) {
        const values = (opt.values || opt.value || []).join(",");
        const radius = typeof opt.radius === "string" ? parseInt(opt.radius, 10) : (opt.radius || 0);

        await ProductOption.create(
          {
            product_id: product.id,
            title: opt.title,
            shape: opt.shape || "square",
            radius,
            type: opt.type || "text",
            values,
          },
          { transaction },
        );
      }

      // Associa categorias
      for (const category_id of category_ids) {
        await ProductCategory.create(
          { product_id: product.id, category_id },
          { transaction },
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
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids = [],
      images = [],
      options = [],
    } = req.body || {};

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      !name || !slug ||
      typeof name !== "string" || typeof slug !== "string" ||
      typeof price !== "number" || typeof price_with_discount !== "number" ||
      !Array.isArray(category_ids) || !Array.isArray(images) || !Array.isArray(options)
    ) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    // Valida categorias
    const foundCategories = await Category.findAll({
      attributes: ["id"],
      where: { id: { [Op.in]: category_ids } },
      raw: true,
    });
    if (foundCategories.length !== category_ids.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const imageIds = images.map((img) => img.id).filter(Boolean);
    const optionIds = options.map((opt) => opt.id).filter(Boolean);

    const existingImages = await ProductImage.findAll({
      where: { product_id: product.id, id: imageIds },
    });
    const existingOptions = await ProductOption.findAll({
      where: { product_id: product.id, id: optionIds },
    });

    const transaction = await sequelize.transaction();

    try {
      await product.update(
        { enabled, name, slug, stock, description, price, price_with_discount },
        { transaction },
      );

      // Atualiza categorias vinculadas
      await ProductCategory.destroy({ where: { product_id: product.id }, transaction });
      if (category_ids.length > 0) {
        await ProductCategory.bulkCreate(
          category_ids.map((category_id) => ({ product_id: product.id, category_id })),
          { transaction },
        );
      }

      // Atualiza ou cria imagens
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const current = existingImages.find((item) => item.id === img.id);

        if (img.deleted) {
          if (current) await current.destroy({ transaction });
          continue;
        }

        let imgPath = img.content;
        if (img.content && !/^https?:\/\//.test(img.content)) {
          const uploadDir = path.join(__dirname, "../../media/products", String(product.id));
          const ext = img.type === "image/png" ? "png" : "jpg";
          const fileName = `image-${Date.now()}-${i + 1}.${ext}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(filePath, Buffer.from(img.content, "base64"));
          imgPath = `media/products/${product.id}/${fileName}`;
        }

        if (current) {
          await current.update({ path: imgPath }, { transaction });
        } else {
          await ProductImage.create({ product_id: product.id, path: imgPath }, { transaction });
        }
      }

      // Atualiza ou cria opções
      for (const opt of options) {
        const current = existingOptions.find((item) => item.id === opt.id);

        if (opt.deleted) {
          if (current) await current.destroy({ transaction });
          continue;
        }

        const values = (opt.values || opt.value || []).join(",");
        const radius = typeof opt.radius === "string" ? parseInt(opt.radius, 10) : opt.radius;
        const optData = {
          ...(opt.title !== undefined && { title: opt.title }),
          ...(opt.shape !== undefined && { shape: opt.shape }),
          ...(radius !== undefined && { radius }),
          ...(opt.type !== undefined && { type: opt.type }),
          ...(values !== undefined && { values }),
        };

        if (current) {
          await current.update(optData, { transaction });
        } else {
          await ProductOption.create({ ...optData, product_id: product.id }, { transaction });
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
      const where = { product_id: product.id };
      await ProductCategory.destroy({ where, transaction });
      await ProductImage.destroy({ where, transaction });
      await ProductOption.destroy({ where, transaction });
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
