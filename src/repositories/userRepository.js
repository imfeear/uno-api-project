const { User } = require("../models");

async function create(data) {
  return User.create(data);
}

async function findById(id) {
  return User.findByPk(id);
}

async function findByUsername(username) {
  return User.findOne({ where: { username } });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

module.exports = { create, findById, findByUsername, findByEmail };
