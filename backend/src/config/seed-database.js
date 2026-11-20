require("dotenv").config({ quiet: true });
const sequelize = require("./database");
const User = require("../models/User");
const Category = require("../models/category");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");

async function seedDatabase() {
  try {
    console.log("Iniciando população do banco de dados...");

    // Cria as tabelas se não existirem
    await sequelize.sync();

    // 1. Cria usuário padrão para testes
    const [user] = await User.findOrCreate({
      where: { email: "admin@email.com" },
      defaults: {
        firstname: "Admin",
        surname: "Sistema",
        email: "admin@email.com",
        password: "password123",
      },
    });
    console.log("Usuário padrão pronto:", user.email);

    // 2. Cria categorias padrão
    const categoriesData = [
      { name: "Camisetas", slug: "camisetas", use_in_menu: true },
      { name: "Calças", slug: "calcas", use_in_menu: true },
      { name: "Bonés", slug: "bones", use_in_menu: true },
      { name: "Headphones", slug: "headphones", use_in_menu: true },
      { name: "Tênis", slug: "tenis", use_in_menu: true },
    ];

    const categories = [];
    for (const cat of categoriesData) {
      const [category] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
      categories.push(category);
    }
    console.log(`${categories.length} categorias cadastradas.`);

    const tenisCategory = categories.find((c) => c.slug === "tenis") || categories[4];
    const camisetaCategory = categories.find((c) => c.slug === "camisetas") || categories[0];
    const calcaCategory = categories.find((c) => c.slug === "calcas") || categories[1];
    const headphonesCategory = categories.find((c) => c.slug === "headphones") || categories[3];

    // 3. 8 Produtos padrão com dados realistas
    const sampleProducts = [
      {
        name: "Tênis K-Swiss Court 2",
        slug: "tenis-k-swiss-court-2",
        price: 200.0,
        price_with_discount: 149.9,
        stock: 15,
        enabled: true,
        use_in_menu: true,
        description: "Tênis casual K-Swiss clássico com excelente acabamento e conforto para o dia a dia.",
        category: tenisCategory,
        image: "/White-Sneakers-PNG-Clipart 1.png",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "39,40,41,42,43" },
          { title: "Cor", shape: "circle", type: "color", values: "#6FEEFF,#FF6969,#5D5D5D,#6D70B7" },
        ],
      },
      {
        name: "Tênis Nike Air Zoom",
        slug: "tenis-nike-air-zoom",
        price: 349.9,
        price_with_discount: 299.9,
        stock: 20,
        enabled: true,
        use_in_menu: true,
        description: "Nike Air Zoom com amortecimento dinâmico e resposta rápida para treinos e caminhadas.",
        category: tenisCategory,
        image: "/produc-image-1.jpeg",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "38,39,40,41,42" },
          { title: "Cor", shape: "circle", type: "color", values: "#1F1F1F,#FFFFFF,#EE4266" },
        ],
      },
      {
        name: "Tênis Adidas Superstar",
        slug: "tenis-adidas-superstar",
        price: 279.9,
        price_with_discount: 219.9,
        stock: 12,
        enabled: true,
        use_in_menu: true,
        description: "O clássico atemporal da Adidas. Estilo urbano com biqueira shell toe e cabedal em couro.",
        category: tenisCategory,
        image: "/produc-image-2.jpeg",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "37,38,39,40,41" },
        ],
      },
      {
        name: "Tênis Puma Flyer Runner",
        slug: "tenis-puma-flyer-runner",
        price: 239.9,
        price_with_discount: 189.9,
        stock: 18,
        enabled: true,
        use_in_menu: true,
        description: "Super leve e confortável, ideal para corrida leve e uso prolongado durante o dia.",
        category: tenisCategory,
        image: "/produc-image-3.jpeg",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "39,40,41,42" },
          { title: "Cor", shape: "circle", type: "color", values: "#52CA76,#1F1F1F" },
        ],
      },
      {
        name: "Camiseta K-Swiss Logo",
        slug: "camiseta-k-swiss-logo",
        price: 89.9,
        price_with_discount: 69.9,
        stock: 30,
        enabled: true,
        use_in_menu: true,
        description: "Camiseta 100% algodão com gola careca reforçada e estampa frontal exclusiva.",
        category: camisetaCategory,
        image: "/product-thumb-5.jpeg",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "P,M,G,GG" },
          { title: "Cor", shape: "circle", type: "color", values: "#FFFFFF,#1F1F1F,#991956" },
        ],
      },
      {
        name: "Calça Jogger Streetwear",
        slug: "calca-jogger-streetwear",
        price: 159.9,
        price_with_discount: 129.9,
        stock: 14,
        enabled: true,
        use_in_menu: true,
        description: "Calça jogger com elástico no tornozelo, bolsos cargo laterais e tecido respirável.",
        category: calcaCategory,
        image: "/produc-image-4.jpeg",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "38,40,42,44" },
        ],
      },
      {
        name: "Headphone Beats Bass Wireless",
        slug: "headphone-beats-bass-wireless",
        price: 499.9,
        price_with_discount: 399.9,
        stock: 8,
        enabled: true,
        use_in_menu: true,
        description: "Som potente com graves profundos, bateria com duração de até 40 horas e conexão bluetooth 5.0.",
        category: headphonesCategory,
        image: "/produc-image-5.jpeg",
        options: [
          { title: "Cor", shape: "circle", type: "color", values: "#1F1F1F,#FFFFFF,#EE4266" },
        ],
      },
      {
        name: "Tênis Nike Revolution 6",
        slug: "tenis-nike-revolution-6",
        price: 299.9,
        price_with_discount: 249.9,
        stock: 25,
        enabled: true,
        use_in_menu: true,
        description: "Design simples e moderno com pelo menos 20% de conteúdo reciclado por peso.",
        category: tenisCategory,
        image: "/White-Sneakers-PNG-Clipart 1.png",
        options: [
          { title: "Tamanho", shape: "square", radius: 4, type: "text", values: "39,40,41,42,43" },
          { title: "Cor", shape: "circle", type: "color", values: "#B5B6F2,#1F1F1F" },
        ],
      },
    ];

    for (const item of sampleProducts) {
      let product = await Product.findOne({ where: { slug: item.slug } });
      if (!product) {
        product = await Product.create({
          name: item.name,
          slug: item.slug,
          price: item.price,
          price_with_discount: item.price_with_discount,
          stock: item.stock,
          enabled: item.enabled,
          use_in_menu: item.use_in_menu,
          description: item.description,
        });

        // Associa à categoria
        if (item.category) {
          await ProductCategory.findOrCreate({
            where: { product_id: product.id, category_id: item.category.id },
          });
        }

        // Imagem principal
        await ProductImage.create({
          product_id: product.id,
          enabled: true,
          path: item.image,
        });

        // Opções (tamanho, cor)
        if (item.options) {
          for (const opt of item.options) {
            await ProductOption.create({
              product_id: product.id,
              title: opt.title,
              shape: opt.shape || "square",
              radius: opt.radius || 0,
              type: opt.type || "text",
              values: opt.values,
            });
          }
        }
      }
    }

    console.log("População concluída com sucesso! 8 produtos cadastrados.");
  } catch (error) {
    console.error("Erro ao popular banco de dados:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedDatabase();

