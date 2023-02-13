"use strict";

const axios = require("axios");
const semver = require("semver");

/**
 * @description 获取 npm 包信息
 * @param {string} npmName npm 包名
 * @param {registry} registry 默认的 registry
 */
async function getNpmInfo(npmName, registry) {
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const urlJoin = await import("url-join");
  const npmInfoUrl = urlJoin.default(registryUrl, npmName);
  return axios
    .get(npmInfoUrl)
    .then((response) => {
      if (response?.status === 200) return response?.data;
    })
    .catch((err) => Promise.reject(err));
}

/**
 * @description 获取默认的 registry 地址
 * @param {boolean} isOriginal 是否是 npm 原生的 registry 地址
 */
function getDefaultRegistry(isOriginal) {
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npm.taobao.org";
}

/**
 * @description 获取 npm 包的所有版本号
 * @param {string} npmName npm 包名
 * @param {registry} registry 默认的 registry
 */
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  return Object.keys(data?.versions || []);
}

/**
 * @description 获取符合条件的所有版本号
 * @param {string} baseVersion 当前版本的版本号
 * @param {string[]} versions 所有版本号的数组集合
 */
function getNpmSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => (semver.gt(b, a) ? 1 : -1));
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getNpmSemverVersions(baseVersion, versions);
  if (newVersions?.length) return newVersions[0];
  return null;
}

module.exports = { getNpmSemverVersion };
