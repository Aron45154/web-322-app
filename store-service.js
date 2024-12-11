//const { Sequelize, DataTypes, Op } = require("sequelize");

// var sequelize = new Sequelize("neondb", "neondb_owner", "3abzxREu6LrJ", {
//   host: "ep-small-mode-a5k35p9w.us-east-2.aws.neon.tech",
//   dialect: "postgres",
//   port: 5432,
//   dialectOptions: {
//     ssl: { rejectUnauthorized: false },
//   },
//   query: { raw: true },
// });
//const { Sequelize } = require('sequelize');
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgresql://neondb_owner:w1YFWaPIx0JZ@ep-snowy-waterfall-a58edxgo.us-east-2.aws.neon.tech/neondb?sslmode=require', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});


const Item = sequelize.define(
  "Item",
  {
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    featureImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Disable automatic timestamps
  }
);

// Define the Category model
const Category = sequelize.define(
  "Category",
  {
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Item.belongsTo(Category, { foreignKey: "category" });

module.exports = { sequelize, Item, Category };

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => resolve())
      .catch((err) => reject("unable to sync the database"));
  });
};

module.exports.getItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { id: id },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("no results returned");
        }
      })
      .catch(() => reject("no results returned"));
  });
};

module.exports.getAllItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then((data) => resolve(data))
      .catch(() => reject("no results returned"));
  });
};

module.exports.getPublishedItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { published: true },
    })
      .then((data) => resolve(data))
      .catch(() => reject("no results returned"));
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => resolve(data))
      .catch(() => reject("no results returned"));
  });
};

module.exports.addItem = function (itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published ? true : false;
    for (const prop in itemData) {
      if (itemData[prop] === "") itemData[prop] = null;
    }
    itemData.itemDate = new Date();
    console.log(itemData);
    Item.create(itemData)
      .then(() => resolve())
      .catch((err) => {
        console.log(err);
        reject("unable to create item");
      });
  });
};

module.exports.getItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { category: category },
    })
      .then((data) => resolve(data))
      .catch(() => reject("no results returned"));
  });
};

module.exports.getItemsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        itemDate: {
          [Op.gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => resolve(data))
      .catch(() => reject("no results returned"));
  });
};

module.exports.getPublishedItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
        category: category,
      },
    })
      .then((data) => resolve(data))
      .catch(() => reject("no results returned"));
  });
};
module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (const prop in categoryData) {
      if (categoryData[prop] === "") categoryData[prop] = null;
    }
    Category.create(categoryData)
      .then(() => resolve())
      .catch(() => reject("unable to create category"));
  });
};

module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({ where: { id: id } })
      .then(() => resolve())
      .catch(() => reject("unable to delete category"));
  });
};

module.exports.deleteItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({ where: { id: id } })
      .then(() => resolve())
      .catch(() => reject("unable to delete item"));
  });
};
